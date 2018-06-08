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
Object.defineProperty(exports, "__esModule", { value: true });
const CosSdk = require("cos-nodejs-sdk-v5");
const shortid = require("shortid");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const common_entity_1 = require("./common.entity");
const config_1 = require("../../config");
let CommonService = class CommonService {
    constructor(ImageRepository) {
        this.ImageRepository = ImageRepository;
        this.cos = new CosSdk({
            AppId: config_1.default.qcloudAppId,
            SecretId: config_1.default.qcloudSecretId,
            SecretKey: config_1.default.qcloudSecretKey,
            Domain: `http://${config_1.default.cos.fileBucket}-${config_1.default.qcloudAppId}.${config_1.default.cos.region}.myqcloud.com/`,
        });
    }
    save(fileObject) {
        const image = new common_entity_1.Image();
        image.name = fileObject.name;
        image.url = fileObject.imgUrl;
        image.meta = fileObject.mimeType;
        return this.ImageRepository.save(image);
    }
    saveInCloud(file) {
        console.log(file);
        const imgKey = `${Date.now()}-${shortid.generate()}.${file.mimetype.split('/')[1]}`;
        const uploadFolder = config_1.default.cos.uploadFolder
            ? config_1.default.cos.uploadFolder + '/'
            : '';
        const params = {
            Bucket: config_1.default.cos.fileBucket,
            Region: config_1.default.cos.region,
            Key: `${uploadFolder}${imgKey}`,
            FilePath: file.path,
            ContentLength: file.size,
        };
        return new Promise((resolve, reject) => {
            this.cos.sliceUploadFile(params, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        imgUrl: `http://${data.Location}`,
                        size: file.size,
                        mimeType: file.mimetype,
                        name: file.originalname,
                    });
                }
            });
        });
    }
};
CommonService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(common_entity_1.Image)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CommonService);
exports.CommonService = CommonService;
//# sourceMappingURL=common.service.js.map