module.exports = {
    preset: "ts-jest",
    transform: {
        '^.+\\.ts?$': 'ts-jest'
      },
    testEnvironment: "node",
    roots: ["<rootDir>/", "<rootDir>../Test"],
    collectCoverage: true,
    clearMocks: true,
    coverageDirectory: "coverage",
};