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
const product_entity_1 = require("./product.entity");
const typeorm_2 = require("typeorm");
const common_entity_1 = require("common/common.entity");
const feature_entity_1 = require("filter/feature.entity");
const category_entity_1 = require("category/category.entity");
let ProductService = class ProductService {
    constructor(productRepository, imageRepository, featureRepository, categoryRepository) {
        this.productRepository = productRepository;
        this.imageRepository = imageRepository;
        this.featureRepository = featureRepository;
        this.categoryRepository = categoryRepository;
    }
    getOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.productRepository.findOne(id);
        });
    }
    getAll(getParams = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                take: getParams.size || 20,
                skip: getParams.page ? (getParams.page - 1) * 10 : 0,
            };
            if (!getParams.features && getParams.category) {
                const category = yield this.categoryRepository.findOne(getParams.category);
                const [products, total] = yield this.productRepository.findAndCount(Object.assign({}, options, { where: { category } }));
                return {
                    list: products,
                    total,
                };
            }
            if (getParams.features && getParams.features.length > 0) {
                const raw = yield typeorm_2.createQueryBuilder()
                    .select('productId')
                    .addSelect('count(*)', 'countNum')
                    .from('product_features_feature', 'features')
                    .where({
                    featureId: typeorm_2.In(getParams.features),
                })
                    .groupBy('productId')
                    .having(`countNum = ${getParams.features.length}`)
                    .getRawMany();
                const productIds = raw.map(obj => obj.productId);
                if (productIds.length < 1) {
                    return {
                        list: [],
                        total: 0,
                    };
                }
                const [products, total] = yield this.productRepository.findAndCount(Object.assign({}, options, { relations: ['category'], where: { id: typeorm_2.In(productIds), category: getParams.category } }));
                return {
                    list: products,
                    total,
                };
            }
            const [products, total] = yield this.productRepository.findAndCount(options);
            return {
                list: products,
                total,
            };
        });
    }
    create(productData) {
        return __awaiter(this, void 0, void 0, function* () {
            const getCategory = this.categoryRepository.findOne(productData.category);
            const getCover = this.imageRepository.findOne(productData.cover);
            const getDetail = this.imageRepository.findByIds(productData.detail);
            const getFeatures = this.featureRepository.findByIds(productData.features);
            const [cover, detail, features, category] = yield Promise.all([
                getCover,
                getDetail,
                getFeatures,
                getCategory,
            ]);
            const product = new product_entity_1.Product();
            product.name = productData.name;
            product.category = category;
            product.cover = cover;
            product.detail = detail;
            product.features = features;
            try {
                return yield this.productRepository.save(product);
            }
            catch (err) {
                throw new common_1.HttpException('图片重复了', common_1.HttpStatus.CONFLICT);
            }
        });
    }
    update(productData) {
        return __awaiter(this, void 0, void 0, function* () {
            const getCategory = this.categoryRepository.findOne(productData.category);
            const getProduct = this.productRepository.findOne(productData.id);
            const getCover = this.imageRepository.findOne(productData.cover);
            const getDetail = this.imageRepository.findByIds(productData.detail);
            const getFeatures = this.featureRepository.findByIds(productData.features);
            const [product, cover, detail, features, category] = yield Promise.all([
                getProduct,
                getCover,
                getDetail,
                getFeatures,
                getCategory,
            ]);
            product.name = productData.name;
            product.category = category;
            product.cover = cover;
            product.detail = detail;
            product.features = features;
            return yield this.productRepository.save(product);
        });
    }
    remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.productRepository.delete(id);
        });
    }
};
ProductService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(product_entity_1.Product)),
    __param(1, typeorm_1.InjectRepository(common_entity_1.Image)),
    __param(2, typeorm_1.InjectRepository(feature_entity_1.Feature)),
    __param(3, typeorm_1.InjectRepository(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProductService);
exports.ProductService = ProductService;
//# sourceMappingURL=product.service.js.map