"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("../src/utils/helper");
const helper_2 = require("../src/utils/helper");
describe('bytesToMb', () => {
    it('should convert bytes to megabytes correctly', () => {
        const bytes = 1048576; // 1 MB in bytes
        const result = (0, helper_1.bytesToMb)(bytes);
        expect(result).toBe(1); // Should be 1 MB
    });
    it('should return 0 when bytes are 0', () => {
        const bytes = 0;
        const result = (0, helper_1.bytesToMb)(bytes);
        expect(result).toBe(0);
    });
});
describe('getImageUrl', () => {
    const originalEnv = process.env;
    beforeEach(() => {
        process.env = Object.assign({}, originalEnv); // backup current env
    });
    afterEach(() => {
        process.env = originalEnv; // restore original env
    });
    it('should return the correct image URL', () => {
        process.env.APP_URL = 'http://localhost:3000/';
        const imgName = 'image.png';
        const result = (0, helper_2.getImageUrl)(imgName);
        expect(result).toBe('http://localhost:3000/news/image.png');
    });
    it('should handle missing APP_URL environment variable', () => {
        delete process.env.APP_URL;
        const imgName = 'image.png';
        const result = (0, helper_2.getImageUrl)(imgName);
        expect(result).toBe('undefinednews/image.png');
    });
});
