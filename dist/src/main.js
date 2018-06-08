"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const validation_pipe_1 = require("pipe/validation.pipe");
const swagger_1 = require("@nestjs/swagger");
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = yield core_1.NestFactory.create(app_module_1.AppModule);
        app.useGlobalPipes(new validation_pipe_1.ValidationPipe());
        app.useStaticAssets(__dirname + '/public');
        app.setBaseViewsDir(__dirname + '/public');
        app.setViewEngine('html');
        app.enableCors();
        const options = new swagger_1.DocumentBuilder()
            .setTitle('seven rabbit server')
            .setDescription('The API of seven rabbit server')
            .setVersion('1.0')
            .addTag('server')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, options);
        swagger_1.SwaggerModule.setup('/api', app, document);
        yield app.listen(80);
    });
}
bootstrap();
//# sourceMappingURL=main.js.map