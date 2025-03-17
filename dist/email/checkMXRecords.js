"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMXRecords = void 0;
const dns_1 = __importDefault(require("dns"));
const checkMXRecords = (email) => {
    return new Promise((resolve) => {
        const domain = email.split("@")[1];
        dns_1.default.resolveMx(domain, (err, addresses) => {
            if (err || addresses.length === 0) {
                dns_1.default.resolve(domain, (err, addresses) => {
                    if (err || addresses.length === 0) {
                        console.log(`❌ No A/AAAA records found for ${domain}`);
                        resolve(false);
                    }
                    else {
                        console.log(`✅ A/AAAA records found for ${domain}:`, addresses);
                        resolve(true);
                    }
                });
            }
            else {
                console.log(`✅ MX records found for ${domain}:`, addresses);
                resolve(true);
            }
        });
    });
};
exports.checkMXRecords = checkMXRecords;
//# sourceMappingURL=checkMXRecords.js.map