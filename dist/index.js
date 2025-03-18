"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const express_1 = __importDefault(require("express"));
const schema_js_1 = __importDefault(require("./schema.js"));
const mongoose_1 = __importDefault(require("mongoose"));
const app = (0, express_1.default)();
const server = new mcp_js_1.McpServer({
    name: 'Weather Server',
    version: '1.0.0',
});
function getWeatherByCityName(city) {
    return __awaiter(this, void 0, void 0, function* () {
        if (city.toLowerCase() === 'patiala')
            return { temp: '32C', forecase: 'chances of high rain' };
        if (city.toLowerCase() === 'jalna')
            return { temp: '25C', forecase: 'cloudy' };
        if (city.toLowerCase() === 'mumbai')
            return { temp: '42C', forecase: 'jal jaoge' };
        return { temp: null, error: 'unable to get data' };
    });
}
function connectToMongoDB() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(process.env.MONGODB_URI || '');
        }
        catch (error) {
            console.error('Error connecting to MongoDB:', error);
            throw new Error('Failed to connect to MongoDB');
        }
    });
}
server.tool('getWeatherByCityName', {
    city: zod_1.z.string().describe('The name of the city to get the weather for'),
}, (_a) => __awaiter(void 0, [_a], void 0, function* ({ city }) {
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(yield getWeatherByCityName(city))
            }
        ]
    };
}));
server.tool('get_users', {}, () => __awaiter(void 0, void 0, void 0, function* () {
    yield connectToMongoDB();
    const users = yield schema_js_1.default.find();
    return {
        content: [{ type: 'text', text: JSON.stringify(users) }]
    };
}));
server.tool('add_user', {
    name: zod_1.z.string(),
    email: zod_1.z.string().email()
}, (_a) => __awaiter(void 0, [_a], void 0, function* ({ name, email }) {
    yield connectToMongoDB();
    const newUser = new schema_js_1.default({
        email,
        name
    });
    yield newUser.save();
    return {
        content: [{ type: 'text', text: `User ${name} added successfully`
            }]
    };
}));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(process.env.MONGODB_URI);
        yield connectToMongoDB();
        const transport = new stdio_js_1.StdioServerTransport();
        console.log('Starting weather server...');
        yield server.connect(transport);
    });
}
main();
