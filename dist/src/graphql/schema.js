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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSchema = createSchema;
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const PostResolver_1 = require("./resolvers/PostResolver");
const UserResolver_1 = require("./resolvers/UserResolver");
const CommentResolver_1 = require("./resolvers/CommentResolver");
const VoteResolver_1 = require("./resolvers/VoteResolver");
function createSchema() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, type_graphql_1.buildSchema)({
            resolvers: [PostResolver_1.PostResolver, UserResolver_1.UserResolver, CommentResolver_1.CommentResolver, VoteResolver_1.VoteResolver],
            validate: false,
        });
    });
}
//# sourceMappingURL=schema.js.map