const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Next.js 앱의 경로를 제공합니다.
  dir: "./",
});

// Jest에 전달할 사용자 정의 구성
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testEnvironment: "jest-environment-jsdom",
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/pages/_app.tsx",
    "!src/pages/_document.tsx",
  ],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}",
  ],
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  transformIgnorePatterns: [
    "/node_modules/",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
};

// createJestConfig는 Next.js 앱의 구성과 사용자 정의 구성을 병합합니다.
module.exports = createJestConfig(customJestConfig);
