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
const feature_entity_1 = require("./feature.entity");
const category_entity_1 = require("category/category.entity");
let Filter = class Filter {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Filter.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Filter.prototype, "name", void 0);
__decorate([
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], Filter.prototype, "pos", void 0);
__decorate([
    typeorm_1.OneToMany(type => feature_entity_1.Feature, feature => feature.filter, {
        eager: true,
    }),
    __metadata("design:type", Array)
], Filter.prototype, "features", void 0);
__decorate([
    typeorm_1.ManyToMany(type => category_entity_1.Category, category => category.filters),
    __metadata("design:type", Array)
], Filter.prototype, "categories", void 0);
Filter = __decorate([
    typeorm_1.Entity()
], Filter);
exports.Filter = Filter;
//# sourceMappingURL=filter.entity.js.map