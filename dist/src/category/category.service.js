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
const typeorm_1 = require("@nestjs/typeorm");
const category_entity_1 = require("./category.entity");
const typeorm_2 = require("typeorm");
const filter_entity_1 = require("filter/filter.entity");
const common_entity_1 = require("common/common.entity");
let CategoryService = class CategoryService {
    constructor(categoryRepository, filterRepository, imageRepository) {
        this.categoryRepository = categoryRepository;
        this.filterRepository = filterRepository;
        this.imageRepository = imageRepository;
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.categoryRepository.find();
        });
    }
    getOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.categoryRepository.findOne(id);
        });
    }
    create(createCategoryDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const filters = yield this.filterRepository.findByIds(createCategoryDto.filters);
            const pos = JSON.stringify(filters.map(f => f.id));
            const image = yield this.imageRepository.findOne(createCategoryDto.image);
            const category = new category_entity_1.Category();
            category.name = createCategoryDto.name;
            category.image = image;
            category.pos = pos;
            category.filters = filters;
            try {
                return yield this.categoryRepository.save(category);
            }
            catch (err) {
                throw new common_1.HttpException('图片重复了', common_1.HttpStatus.CONFLICT);
            }
        });
    }
    update(updateCategoryDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const filters = yield this.filterRepository.findByIds(updateCategoryDto.filters);
            const pos = JSON.stringify(filters.map(f => f.id));
            const image = yield this.imageRepository.findOne(updateCategoryDto.image);
            const category = yield this.categoryRepository.findOne(updateCategoryDto.id);
            category.name = updateCategoryDto.name;
            category.image = image;
            category.pos = pos;
            category.filters = filters;
            return yield this.categoryRepository.save(category);
        });
    }
    del(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.categoryRepository.delete(id);
        });
    }
};
CategoryService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(category_entity_1.Category)),
    __param(1, typeorm_1.InjectRepository(filter_entity_1.Filter)),
    __param(2, typeorm_1.InjectRepository(common_entity_1.Image)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CategoryService);
exports.CategoryService = CategoryService;
//# sourceMappingURL=category.service.js.map