"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.storage = exports.firestore = void 0;
const admin = __importStar(require("firebase-admin"));
require('custom-env').env();
const credentials = {
    type: process.env.FIREBASE_TYPE || '',
    project_id: process.env.FIREBASE_PROJECT_ID || '',
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
    private_key: process.env.FIREBASE_PRIVATE_KEY || '',
    client_email: process.env.FIREBASE_CLIENT_EMAIL || '',
    client_id: process.env.FIREBASE_CLIENT_ID || '',
    auth_uri: process.env.FIREBASE_AUTH_URI || '',
    token_uri: process.env.FIREBASE_TOKEN_URI || '',
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || '',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL || '',
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || ''
};
// Configura Firebase
admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(JSON.stringify(credentials))),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'ais-asistente.firebasestorage.app'
});
// Exportar servicios de Firebase
exports.firestore = admin.firestore();
exports.storage = admin.storage();
exports.auth = admin.auth();
