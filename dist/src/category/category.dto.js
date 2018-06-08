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
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateCategoryDto {
}
__decorate([
    swagger_1.ApiModelProperty(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "name", void 0);
__decorate([
    swagger_1.ApiModelProperty(),
    class_validator_1.IsNumber(),
    __metadata("design:type", Number)
], CreateCategoryDto.prototype, "image", void 0);
__decorate([
    swagger_1.ApiModelProperty(),
    class_validator_1.IsArray(),
    __metadata("design:type", Array)
], CreateCategoryDto.prototype, "filters", void 0);
exports.CreateCategoryDto = CreateCategoryDto;
class UpdateCategoryDto extends CreateCategoryDto {
}
__decorate([
    class_validator_1.IsNumber(),
    __metadata("design:type", Number)
], UpdateCategoryDto.prototype, "id", void 0);
exports.UpdateCategoryDto = UpdateCategoryDto;
//# sourceMappingURL=category.dto.js.map