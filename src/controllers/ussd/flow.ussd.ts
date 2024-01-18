import { Request, Response } from 'express';
import { getProducts, findWinnerById, createCashOutRequest } from '../../services/products.service';
import { findById, updateUserBankDetails } from '../../services/user.service';
import { findSubscribedDataById } from '../../services/datasync.service';
import { CashOutRequestType } from '../../helpers/enums';
import { SubscribedProduct, Product } from '../../helpers/interface';

const extraData = [
    {
        "id" : "50",
        "name" : "Unsubscribe"
    },
    {
        "id" : "60",
        "name" : "Winning"
    },
]

export const getProductsUssd = async (req: Request, res: Response) => {
    try {
        const { sessionid } = req.body;
        const products = await getProducts();

        // Map the products array to include only id and name
        const simplifiedProducts = products.map((product: Product) => ({
            id: product.id,
            name: product.name,
        }));

        // extraData array needs to be added to simplified products array
        const responseData = {
            data: simplifiedProducts.concat(extraData), // add the data for winnings and unsubscribe to the returned products 
            endofsession: 1, // Expecting a reply from the customer
            sessionid,
        };
    
        res.status(200).json(responseData);       
    } catch (error) {
        console.error('Get products USSD error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const selectProduct = async (req: Request, res: Response) => {
    try {
        const { sessionid, productid, msisdn } = req.body;
        //handle unsubscribe
        if (productid === "50") {
            //select products from datasync table that user is subscribed to 
            const subscribedProducts: SubscribedProduct[] = await findSubscribedDataById(msisdn);
              
            if (subscribedProducts.length === 0) {
                // If no subscribed products found
                const responseData = {
                    data: {
                        message: "You are not subscribed to any products.",
                    },
                    endofsession: 2,
                    sessionid,
                };
                return res.status(200).json(responseData);
            }

            // Fetch all products from the database
            const allProducts = await getProducts();

            // Filter the products based on subscribedProductIds
            const subscribedProductIds = subscribedProducts.map((subscribedProduct) => subscribedProduct.productId);
            const subscribedProductNames = allProducts
                .filter((product: Product) => subscribedProductIds.includes(product.id))
                .map((product: Product) => product.name);

            const responseData = {
                data: {
                    message: `Confirm you want to unsubscribe from this ${subscribedProductNames}`,
                },
                endofsession: 1,
                sessionid,
            };
            return res.status(200).json(responseData);

            // the unsubscribe feature is handled on datasync.webook
        }

        //handle winning
        if (productid === "60") {
            // Check if msisdn is in winner model
            const checkUser = await findWinnerById(msisdn);
            
            if (!checkUser || !checkUser.length) {
                const responseData = {
                    data: {
                        message: "You don't have any winnings on your line.",
                    },
                    endofsession: 2,
                    sessionid,
                };
                return res.status(200).json(responseData);
            }

            // Fetch user balance
            const user = await findById(msisdn);
            
            if (!user) {
                const responseData = {
                    data: {
                        message: "Unable to fetch user balance.",
                    },
                    endofsession: 2,
                    sessionid,
                };
                return res.status(200).json(responseData);
            }

            const responseData = {
                data: {
                    message: `Your winnings: ${user.balance} cashout to ...`,
                },
                endofsession: 1,
                sessionid,
            };
            
            return res.status(200).json(responseData);
        }

        // If productid doesn't match "50" or "60", check if it matches any product from the database
        const products = await getProducts();
        const selectedProduct = products.find((product:Product) => product.id === productid);

        if (selectedProduct) {
            // Handle the selected product (3rd party api to handle auto renewal or one off subscription should be triggered here)
            const responseData = {
                data: {
                    message: `You selected: ${selectedProduct.name}`,
                },
                endofsession: 1, 
                sessionid,
            };
            return res.status(200).json(responseData);
        }
    
        // Return a default response if the productid doesn't match any case
        const responseData = {
            data: {
                message: "Invalid product selection.",
            },
            endofsession: 2,
            sessionid,
        };
        
        //create a pool for the product

        
        return res.status(200).json(responseData);       
    } catch (error) {
        console.error('select product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const handleWinningUssd = async (req: Request, res: Response) => {
    try {
        const { sessionid, input, msisdn } = req.body;
        
        // handle airtime payout
        if (input === "2") {
            // Fetch user balance
            const user = await findById(msisdn);            
            if (!user) {
                const responseData = {
                    data: {
                        message: "Unable to fetch user balance.",
                    },
                    endofsession: 2,
                    sessionid,
                };
                return res.status(200).json(responseData);
            }

            //create cash out request
            const airtimeAmount = user.balance;
            await createCashOutRequest(msisdn, airtimeAmount, CashOutRequestType.AIRTIME);

            const responseData = {
                data: {
                    message: "You will receive your airtime soon on this line",
                },
                endofsession: 2,
                sessionid,
            };
            
            return res.status(200).json(responseData);
        }

        //bank account
        if (input === "1") {
            const responseData = {
                data: {
                    message: "Enter account details",
                },
                endofsession: 1,
                sessionid,
            };
            return res.status(200).json(responseData);
        }
        
        // Return a default response if the productid doesn't match any case
        const responseData = {
            data: {
                message: "Invalid selection.",
            },
            endofsession: 2,
            sessionid,
        };
        
        return res.status(200).json(responseData);    
    } catch (error) {
        console.error('Handle winning ussd:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateBankDetailsUssd = async (req: Request, res: Response) => {
    try {
        const { sessionid, bankAccount, bankName, AccountName, msisdn } = req.body;
        
        // Fetch user balance
        const user = await findById(msisdn);   

        if (!user) {
            const responseData = {
                data: {
                    message: "Unable to fetch user.",
                },
                endofsession: 2,
                sessionid,
            };
            return res.status(200).json(responseData);
        }

        //create cash out request
        const amount = user.balance;
        await createCashOutRequest(msisdn, amount, CashOutRequestType.BANK);

        // Update user with bank details
        await updateUserBankDetails(msisdn, bankAccount, bankName, AccountName);

        const responseData = {
            data: {
                message: "Bank details updated successfully",
            },
            endofsession: 2,
            sessionid,
        };
        return res.status(200).json(responseData);
    } catch (error) {
        console.error('update bank details error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


//CREATE A CASHOUTREQUEST
export const createCashOutRequestHandler = async (req: Request, res: Response) => {
    const { msisdn, amount, type } = req.body;
    try {
      const request = await createCashOutRequest(msisdn, amount, type);
      res.status(201).json({ 
        message: 'Cash out request created successfully',
        request: request,
     });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while creating the cash out request' });
    }
  };