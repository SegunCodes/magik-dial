import { Request, Response } from 'express';
import { createCashOutRequest, findWinnerById, getProducts } from '../../services/products.service';
import { Product, SubscribedProduct } from '../../helpers/interface';
import { findSubscribedDataById, unsubscribeUser } from '../../services/datasync.service';
import { findById, updateUserBankDetails } from '../../services/user.service';
import { CashOutRequestType } from '../../helpers/enums';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

enum UssdSteps {
  Welcome,
  SelectGame,
  SelectRenewalOption,
  ProcessWinning,
  UnsubscribeConfirmation,
  UpdateBankDetails,
  EnterBank,
  EnterAccountNumber,
  EnterAccountName,
  ExpiredSession,
  MainMenu
}

interface UssdResponse {
  response: string;
  endOfSession: number;
}

function isValidNumericInput(input: string, minValue: number, maxValue: number): boolean {
    const numericInput = parseInt(input, 10);
    return !isNaN(numericInput) && numericInput >= minValue && numericInput <= maxValue;
}
  

export const ussdWebhook = async (req: Request, res: Response) => {
  try {
    const { msisdn, input, sessionid } = req.body;

    // Get the current step from the session data
    const step = await getSessionStep(sessionid);
    let response = '';
    let endOfSession = 1; // Default to expecting a reply
    let responseData: any = {};

    switch (step) {
      case UssdSteps.Welcome:
        try {
          const products = await getProducts();
          if (products.length === 0) {
            // Handle the case when there are no products
            response = `Sorry, no products are available at the moment.`;
            endOfSession = 2; // End the session
          } else {
              const productList = (products as Product[]).map((product, index) => `${index + 1}. ${product.name}`).join('\n');
              response = `Welcome to Green Lotto!\nPlease select a game to play:\n${productList}\n${products.length + 2}. Winning\n${products.length + 3}. Unsubscribe`;

              // Update the session with the available products
              await updateSession(msisdn, sessionid, UssdSteps.SelectGame, endOfSession);
          }
        } catch (error) {
          console.error('Error fetching products:', error);
          response = 'An error occurred while fetching products.';
          endOfSession = 2; // End the session
        }
        break;
      case UssdSteps.SelectGame:
        const handleGameSelectionResult = await handleGameSelection(msisdn, sessionid, input);
        response = handleGameSelectionResult.response;
        endOfSession = handleGameSelectionResult.endOfSession;
        break;
      case UssdSteps.SelectRenewalOption:
        if (isValidNumericInput(input, 1, 2)) {
          const renewalOption = parseInt(input, 10);
      
          // Use the selected renewal option to customize the response
          const renewalMessage = renewalOption === 1 ? 'Daily Auto Renewal' : 'One-off';
          
          response = `You have selected ${renewalMessage}. Thank you for playing. Your subscription is confirmed.`;
          endOfSession = 2;
        } else {
          response = 'Invalid selection. Please choose either 1 or 2.';
          endOfSession = 1;
        }
        break; 
      case UssdSteps.ProcessWinning:
        const handleProcessWinningResult = await handleProcessWinning(msisdn, sessionid, input);
        response = handleProcessWinningResult.response;
        endOfSession = handleProcessWinningResult.endOfSession;
        break;
      case UssdSteps.UnsubscribeConfirmation:
        const handleUnsubscribeConfirmationResult = await handleUnsubscribeConfirmation(msisdn, sessionid, input);
        response = handleUnsubscribeConfirmationResult.response;
        endOfSession = handleUnsubscribeConfirmationResult.endOfSession;
        break;
      case UssdSteps.UpdateBankDetails:
        const handleUpdateBankResult = await handleUpdateBankDetails(msisdn, sessionid, input, step);
        response = handleUpdateBankResult.response;
        endOfSession = handleUpdateBankResult.endOfSession;
        break;
      case UssdSteps.ExpiredSession:
        response = "Your session has expired. Please try again.";
        endOfSession = 2;
        break;
      case UssdSteps.MainMenu:
        const handleMainMenuResult = await handleMainMenu(msisdn, sessionid, input);
        response = handleMainMenuResult.response;
        endOfSession = handleMainMenuResult.endOfSession;
        break;
      default:
        response = `Invalid step.`;
        endOfSession = 2; // End of session
    }

    responseData = {
      data: response,
      endofsession: endOfSession,
      sessionid: sessionid,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('USSD webhook error:', error);
    res.status(500).send(`END Server error`);
  }
};

async function handleGameSelection(msisdn: string, sessionid: string, input: string): Promise<UssdResponse> {
  let response = '';
  let endOfSession = 1;

  const allProducts: Product[] = await getProducts();

  if (isValidNumericInput(input, 1, allProducts.length + 1)) {
    const selectedProductIndex = parseInt(input) - 1;

    if (selectedProductIndex < allProducts.length) {
      // User selected a game from 1 to the number of available products
      const selectedProduct = allProducts[selectedProductIndex];
      response = `Congratulations! You have selected ${selectedProduct.name} and stand a chance of winning ${selectedProduct.amount} million naira. \n 1. Daily Auto Renewal \n2. One-off.`;
      endOfSession = 1;
      await updateSession(msisdn, sessionid, UssdSteps.SelectRenewalOption, endOfSession);
    }
  } else { 
    console.log('Entering else block');
    console.log('Input:', input);
    if (input.trim() == '7') {
      // User selected Winning
      const checkUser = await findWinnerById(msisdn);
      if (!checkUser || !checkUser.length) {
        response = `You don't have any winnings on your line. \n1. Main Menu`;
        endOfSession = 1;
        await updateSession(msisdn, sessionid, UssdSteps.MainMenu, endOfSession);
      } else {
        // Fetch user balance
        const user = await findById(msisdn);
        if (!user) {
          response = `Unable to fetch user balance.`;
          endOfSession = 2;
        } else {
          response = `Your winnings: ${user.balance} cashout to...\n1. Airtime\n2. Data`;
          endOfSession = 1;
          await updateSession(msisdn, sessionid, UssdSteps.ProcessWinning, endOfSession);
        }
      }
    } else if (input == '8') {
      // User selected Unsubscribe
      const subscribedProducts: SubscribedProduct[] = await findSubscribedDataById(msisdn);
      if (subscribedProducts.length === 0) {
        response = `You are not subscribed to any products.`;
        endOfSession = 2;
      } else {
        const allProducts = await getProducts();
        const subscribedProductIds = subscribedProducts.map((subscribedProduct) => subscribedProduct.productId);
        const subscribedProductNames = allProducts
          .filter((product: Product) => subscribedProductIds.includes(product.id))
          .map((product: Product) => product.name);
        response = `Confirm you want to unsubscribe from ${subscribedProductNames.join(', ')}:\n1. Yes\n2. No`;
        endOfSession = 1;
        await updateSession(msisdn, sessionid, UssdSteps.UnsubscribeConfirmation, endOfSession);
      }
    } else {
      response = `Invalid selection.`;
      endOfSession = 2;
    }
  }
  console.log('Response:', response);
  return { response, endOfSession };
}

  
async function handleProcessWinning(msisdn: string, sessionid: string, input: string): Promise<UssdResponse> {
    let response = '';
    let endOfSession = 1; 
    if (input == '1') {
        // User selected Airtime
        const user = await findById(msisdn);
        if (!user) {
            response = `Unable to fetch user balance.`;
            endOfSession = 2; 
        } else {
            const airtimeAmount = user.balance;
            await createCashOutRequest(msisdn, airtimeAmount, CashOutRequestType.AIRTIME);
            response = `You will receive your airtime soon on this line. Thank you! \n1. Main Menu`;
            endOfSession = 1; 
            await updateSession(msisdn, sessionid, UssdSteps.MainMenu, endOfSession);
        }
    } else if (input == '2') {
        // User selected Bank Account
        response = `Please enter your bank name.`;
        endOfSession = 1; 
        await updateSession(msisdn, sessionid, UssdSteps.UpdateBankDetails, endOfSession);
    } else if (input == ''){
        const user = await findById(msisdn);
          if (!user) {
            response = `Unable to fetch user balance.`;
            endOfSession = 2; 
          } else {
            response = `Your winnings: ${user.balance} cashout to...\n1. Airtime\n2. Data`;
            endOfSession = 1; 
          }
    } else {
        response = `Invalid selection.`;
        endOfSession = 2; 
    }
    return { response, endOfSession };
}

async function handleMainMenu(msisdn: string, sessionid: string, input: string): Promise<UssdResponse> {
  let response = '';
  let endOfSession = 1; 
  if (input == '1') {
    const products = await getProducts();
    if (products.length === 0) {
      // Handle the case when there are no products
      response = `Sorry, no products are available at the moment.`;
      endOfSession = 2; // End the session
    } else {
        const productList = (products as Product[]).map((product, index) => `${index + 1}. ${product.name}`).join('\n');
        response = `Welcome to Green Lotto!\nPlease select a game to play:\n${productList}\n${products.length + 2}. Winning\n${products.length + 3}. Unsubscribe`;

        // Update the session with the available products
        await updateSession(msisdn, sessionid, UssdSteps.SelectGame, endOfSession);
    }
  } else {
      response = `Invalid selection.`;
      endOfSession = 2; 
  }
  return { response, endOfSession };
}
  
async function handleUnsubscribeConfirmation(msisdn: string, sessionid: string, input: string): Promise<UssdResponse> {
    let response = '';
    let endOfSession = 1; 
    if (input == '1') {
        // Handle the unsubscribe process via datasync
        await unsubscribeUser(msisdn);
        response = `Your subscription has been cancelled. \n1. Main Menu`;
        endOfSession = 1; 
        await updateSession(msisdn, sessionid, UssdSteps.MainMenu, endOfSession);
    } else if (input == '2') {
        // User chose not to unsubscribe
        response = `Unsubscribe canceled. Thank you.\n1. Main Menu`;
        endOfSession = 1; 
        await updateSession(msisdn, sessionid, UssdSteps.MainMenu, endOfSession);
    } else if (input == ''){
        // User selected Unsubscribe
        const subscribedProducts: SubscribedProduct[] = await findSubscribedDataById(msisdn);
        if (subscribedProducts.length === 0) {
          response = `You are not subscribed to any products.`;
          endOfSession = 2;
        } else {
          const allProducts = await getProducts();
          const subscribedProductIds = subscribedProducts.map((subscribedProduct) => subscribedProduct.productId);
          const subscribedProductNames = allProducts
            .filter((product: Product) => subscribedProductIds.includes(product.id))
            .map((product: Product) => product.name);
          response = `Confirm you want to unsubscribe from ${subscribedProductNames.join(', ')}:\n1. Yes\n2. No`;
          endOfSession = 1;
          await updateSession(msisdn, sessionid, UssdSteps.UnsubscribeConfirmation, endOfSession);
        }
    } else {
        response = `END Invalid selection.`;
        endOfSession = 2;
    }
    return { response, endOfSession };
}
  
async function handleUpdateBankDetails(msisdn: string, sessionid: string, input: string, step: UssdSteps): Promise<UssdResponse> {
    let response = '';
    let endOfSession = 1;

    try {
        switch (step) {
            case UssdSteps.EnterBank:
                // Store the bank name in the session data
                if (input.trim() === '') {
                     // User selected Bank Account
                    response = `Please enter your bank name.`;
                    endOfSession = 1;
                    await updateSession(msisdn, sessionid, UssdSteps.UpdateBankDetails, endOfSession )
                } else {
                    await updateSession(msisdn, sessionid, UssdSteps.EnterBank, endOfSession);

                    // Ask the user to enter the account number in the next step
                    response = `Please enter your account number.`;
                    endOfSession = 1;
                }
                break;

            case UssdSteps.EnterAccountNumber:
                // Store the account number in the session data
                if (input.trim() === '') {
                    await updateSession(msisdn, sessionid, UssdSteps.EnterBank, endOfSession);

                    // Ask the user to enter the account number in the next step
                    response = `Please enter your account number.`;
                    endOfSession = 1;
                } else {
                    await updateSession(msisdn, sessionid, UssdSteps.EnterAccountNumber, endOfSession);

                    // Ask the user to enter the account name in the next step
                    response = `Please enter your account name.`;
                    endOfSession = 1;
                }
                break;

            case UssdSteps.EnterAccountName:
                // Store the account name in the session data and update the database with bank details
                if (input.trim() === '') {
                    await updateSession(msisdn, sessionid, UssdSteps.EnterAccountNumber, endOfSession);

                    // Ask the user to enter the account name in the next step
                    response = `Please enter your account name.`;
                    endOfSession = 1;
                } else {
                    await updateSession(msisdn, sessionid, UssdSteps.EnterAccountName,endOfSession);

                    // Fetch user balance
                    const user = await findById(msisdn);
                    if (!user) {
                        response = 'Unable to fetch user';
                        endOfSession = 2;
                    } else {
                        const amount = user.balance;
                        await createCashOutRequest(msisdn, amount, CashOutRequestType.BANK);
                    }

                    // Update the database with bank details
                    const sessionData = getSessionData(msisdn); // Replace with your session data retrieval logic
                    const { bankName, accountNumber, accountName } = sessionData;
                    await updateUserBankDetails(msisdn, bankName, accountNumber, accountName);

                    response = 'Bank details updated successfully. Thank you!';
                    endOfSession = 2;
                }
                break;

            default:
                response = 'Invalid step.';
                endOfSession = 2;
        }

        return { response, endOfSession };
    } catch (error) {
        console.error('Handle bank details error:', error)
        return { response: 'An error occurred', endOfSession: 2 };
    }
}
  
function getSessionData(msisdn: string): any {
    // Implement your logic to retrieve session data based on msisdn
    // This function should return the appropriate session data.
    // For example, you might store session data in a database, cache, or in-memory data structure.
  
    // Placeholder example:
    const sessionData = {
      msisdn,
      step: UssdSteps.EnterAccountName,
      bankName: 'SomeBank',
      accountNumber: '123456789',
      // ... other session data
    };
  
    return sessionData;
}
  
async function getSessionStep(sessionid: string): Promise<UssdSteps> {
  try {
    const session = await prisma.ussdSession.findFirst({
      where: { externalSessionId: sessionid },
      select: { responses: true, expired: true },
    });
    if (session && session.expired) {
      // If the session is expired, provide a specific response
      return UssdSteps.ExpiredSession;
    } else if (session && session.responses && !session.expired) {
      // Map the current step from the database to UssdSteps enum
      return UssdSteps[session.responses as keyof typeof UssdSteps] || UssdSteps.Welcome;
    } else {
      // If no session or currentStep found, default to Welcome step
      return UssdSteps.Welcome;
    }
  } catch (error) {
    console.error('Error fetching session step:', error);
    throw error;
  }
}
  
async function updateSession(msisdn: string, sessionid: string, step: UssdSteps, endofsession: number): Promise<void> {
    try {
      const existingSession = await prisma.ussdSession.findFirst({ where: { msisdn, externalSessionId: sessionid } });
      if (existingSession) {
        // Update the existing session
        await prisma.ussdSession.update({
          where: { id: existingSession.id },
          data: { responses: UssdSteps[step], expired: endofsession === 2 },
        });
      } else {
        // Create a new session for the user
        await prisma.ussdSession.create({
          data: {
            msisdn,
            responses: UssdSteps[step],
            shortcode: "your_shortcode_value", // replace with actual value
            externalSessionId: sessionid, 
            expired: endofsession === 2, 
            lastResponse: "your_last_responss_value", //replace with actuua
          },
        });
      }
  
      console.log(`Updating session for ${msisdn} to step ${step}`);
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
}
  