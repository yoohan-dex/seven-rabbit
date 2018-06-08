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
const typeorm_1 = require("typeorm");
const common_entity_1 = require("common/common.entity");
const feature_entity_1 = require("filter/feature.entity");
const category_entity_1 = require("category/category.entity");
let Product = class Product {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Product.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    typeorm_1.OneToOne(type => common_entity_1.Image, { eager: true }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", common_entity_1.Image)
], Product.prototype, "cover", void 0);
__decorate([
    typeorm_1.ManyToMany(type => common_entity_1.Image, { eager: true }),
    typeorm_1.JoinTable(),
    __metadata("design:type", Array)
], Product.prototype, "detail", void 0);
__decorate([
    typeorm_1.ManyToMany(type => feature_entity_1.Feature, { eager: true }),
    typeorm_1.JoinTable(),
    __metadata("design:type", Array)
], Product.prototype, "features", void 0);
__decorate([
    typeorm_1.ManyToOne(type => category_entity_1.Category, category => category.products, { eager: true }),
    __metadata("design:type", category_entity_1.Category)
], Product.prototype, "category", void 0);
Product = __decorate([
    typeorm_1.Entity()
], Product);
exports.Product = Product;
//# sourceMappingURL=product.entity.js.map