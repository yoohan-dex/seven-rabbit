"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const common_controller_1 = require("./common.controller");
const common_service_1 = require("./common.service");
const typeorm_1 = require("@nestjs/typeorm");
const common_entity_1 = require("./common.entity");
let CommonModule = class CommonModule {
};
CommonModule = __decorate([
    common_1.Module({
        imports: [typeorm_1.TypeOrmModule.forFeature([common_entity_1.Image])],
        controllers: [common_controller_1.CommonController],
        providers: [common_service_1.CommonService],
    })
], CommonModule);
exports.CommonModule = CommonModule;
//# sourceMappingURL=common.module.js.map