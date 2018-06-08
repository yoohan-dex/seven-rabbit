"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const filter_dto_1 = require("./filter.dto");
const filter_service_1 = require("./filter.service");
let FilterController = class FilterController {
    constructor(filterService) {
        this.filterService = filterService;
    }
    create(createFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = yield this.filterService.create(createFilter);
            return filter;
        });
    }
    getFilters() {
        return __awaiter(this, void 0, void 0, function* () {
            const filters = yield this.filterService.getAll();
            return filters;
        });
    }
    getfilter(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = yield this.filterService.getOne(id);
            return filter;
        });
    }
    update(updateFilter, filterId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.filterService.update(Object.assign({ id: filterId }, updateFilter));
        });
    }
};
__decorate([
    common_1.Post(),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_dto_1.CreateFilterDto]),
    __metadata("design:returntype", Promise)
], FilterController.prototype, "create", null);
__decorate([
    common_1.Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FilterController.prototype, "getFilters", null);
__decorate([
    common_1.Get(':id'),
    __param(0, common_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FilterController.prototype, "getfilter", null);
__decorate([
    common_1.Patch(':id'),
    __param(0, common_1.Body()), __param(1, common_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_dto_1.CreateFilterDto, Object]),
    __metadata("design:returntype", Promise)
], FilterController.prototype, "update", null);
FilterController = __decorate([
    common_1.Controller('filter'),
    __metadata("design:paramtypes", [filter_service_1.FilterService])
], FilterController);
exports.FilterController = FilterController;
//# sourceMappingURL=filter.controller.js.map