import { ERROR_TYPES, MARKETPLACES } from "../config/constants.js";

const baseServerUrl = (process.env.APP_BASE_URL || "http://localhost:3000") + "/api";

const productSchema = {
    type: "object",
    properties: {
        id: { type: "string" },
        marketplace: { type: "string", enum: MARKETPLACES },
        product_name: { type: "string" },
        marketplace_sku: { type: "string" },
        internal_sku: { type: "string" },
        description: { type: ["string", "null"] },
        category: { type: "string" },
        brand: { type: ["string", "null"] },
        price: { type: "integer" },
        stock: { type: "integer" },
        weight: { type: "number" },
        thumbnail_url: { type: ["string", "null"] },
        status: { type: "string", enum: ["ACTIVE", "DRAFT", "ARCHIVED"] },
        images: { type: "array", items: { type: "string" } },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
    },
};

const orderSchema = {
    type: "object",
    properties: {
        id: { type: "string" },
        marketplace: { type: "string", enum: MARKETPLACES },
        order_code: { type: "string" },
        status: { type: "string" },
        total_price: { type: "integer" },
        createdAt: { type: "string", format: "date-time" },
        items: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    quantity: { type: "integer" },
                    price: { type: "integer" },
                    marketplace_sku: { type: "string" },
                    product: productSchema,
                },
            },
        },
    },
};

const productCreateExample = {
    summary: "Product payload",
    value: {
        product_name: "iPhone 15 Pro",
        marketplace_sku: "SHP-IPH15PRO",
        internal_sku: "IPH15PRO-BLK",
        description: "Apple flagship smartphone",
        category: "Smartphone",
        brand: "Apple",
        price: 18000000,
        stock: 15,
        weight: 200,
        thumbnail_url: "/uploads/products/iphone1.jpg",
        status: "ACTIVE",
        images: [
            "/uploads/products/iphone1.jpg",
            "/uploads/products/iphone2.jpg",
        ],
    },
};

const productUpdateExample = {
    summary: "Product update payload",
    value: {
        product_name: "iPhone 15 Pro Max",
        description: "Updated product description",
        category: "Smartphone",
        brand: "Apple",
        price: 19500000,
        stock: 12,
        weight: 210,
        thumbnail_url: "/uploads/products/iphone1-new.jpg",
        status: "ACTIVE",
        images: [
            "/uploads/products/iphone1-new.jpg",
            "/uploads/products/iphone2-new.jpg",
        ],
    },
};

const orderCreateExamples = {
    shopee: {
        summary: "Shopee order",
        value: { model_sku: "SHP-IPH15PRO", qty: 1 },
    },
    tokopedia: {
        summary: "Tokopedia order",
        value: { sku: "TOK-IPH15PRO", quantity: 1 },
    },
    lazada: {
        summary: "Lazada order",
        value: { seller_sku: "LZD-IPH15PRO", quantity: 1 },
    },
};

const marketplacePaths = MARKETPLACES.reduce((paths, marketplace) => {
    paths[`/${marketplace}/products`] = {
        get: {
            tags: ["Products"],
            summary: `List ${marketplace} products`,
            parameters: [
                {
                    name: "page",
                    in: "query",
                    required: false,
                    schema: { type: "integer", default: 1 },
                },
                {
                    name: "limit",
                    in: "query",
                    required: false,
                    schema: { type: "integer", default: 20 },
                },
                {
                    name: "search",
                    in: "query",
                    required: false,
                    schema: { type: "string" },
                },
                {
                    name: "category",
                    in: "query",
                    required: false,
                    schema: { type: "string" },
                },
                {
                    name: "status",
                    in: "query",
                    required: false,
                    schema: {
                        type: "string",
                        enum: ["ACTIVE", "DRAFT", "ARCHIVED"],
                    },
                },
                {
                    name: "minPrice",
                    in: "query",
                    required: false,
                    schema: { type: "number" },
                },
                {
                    name: "maxPrice",
                    in: "query",
                    required: false,
                    schema: { type: "number" },
                },
            ],
            responses: {
                200: {
                    description: "Product list",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean" },
                                    items: {
                                        type: "array",
                                        items: productSchema,
                                    },
                                    pagination: {
                                        type: "object",
                                        properties: {
                                            page: { type: "integer" },
                                            limit: { type: "integer" },
                                            total: { type: "integer" },
                                            pages: { type: "integer" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        post: {
            tags: ["Products"],
            summary: `Create a ${marketplace} product`,
            security: [{ InternalSecret: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: [
                                "product_name",
                                "marketplace_sku",
                                "internal_sku",
                                "category",
                                "price",
                                "stock",
                                "weight",
                            ],
                            properties: {
                                product_name: { type: "string" },
                                marketplace_sku: { type: "string" },
                                internal_sku: { type: "string" },
                                description: { type: "string" },
                                category: { type: "string" },
                                brand: { type: "string" },
                                price: { type: "integer" },
                                stock: { type: "integer" },
                                weight: { type: "number" },
                                thumbnail_url: { type: "string" },
                                status: {
                                    type: "string",
                                    enum: ["ACTIVE", "DRAFT", "ARCHIVED"],
                                },
                                images: {
                                    type: "array",
                                    items: { type: "string" },
                                },
                            },
                        },
                        examples: { product: productCreateExample },
                    },
                },
            },
            responses: {
                201: {
                    description: "Created product",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean" },
                                    product: productSchema,
                                },
                            },
                        },
                    },
                },
            },
        },
    };

    paths[`/${marketplace}/products/{id}`] = {
        get: {
            tags: ["Products"],
            summary: `Get a ${marketplace} product`,
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                },
            ],
            responses: {
                200: {
                    description: "Product detail",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean" },
                                    product: productSchema,
                                },
                            },
                        },
                    },
                },
            },
        },
        patch: {
            tags: ["Products"],
            summary: `Update a ${marketplace} product`,
            security: [{ InternalSecret: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                product_name: { type: "string" },
                                description: { type: "string" },
                                category: { type: "string" },
                                brand: { type: "string" },
                                price: { type: "integer" },
                                stock: { type: "integer" },
                                weight: { type: "number" },
                                thumbnail_url: { type: "string" },
                                status: {
                                    type: "string",
                                    enum: ["ACTIVE", "DRAFT", "ARCHIVED"],
                                },
                                images: {
                                    type: "array",
                                    items: { type: "string" },
                                },
                            },
                        },
                        examples: { product: productUpdateExample },
                    },
                },
            },
            responses: {
                200: {
                    description: "Updated product",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean" },
                                    product: productSchema,
                                },
                            },
                        },
                    },
                },
            },
        },
        delete: {
            tags: ["Products"],
            summary: `Archive a ${marketplace} product`,
            security: [{ InternalSecret: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                },
            ],
            responses: {
                200: {
                    description: "Archived product",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean" },
                                    product: productSchema,
                                },
                            },
                        },
                    },
                },
            },
        },
    };

    paths[`/${marketplace}/products/{id}/stock`] = {
        patch: {
            tags: ["Products"],
            summary: `Update ${marketplace} stock`,
            security: [{ InternalSecret: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["stock"],
                            properties: { stock: { type: "integer" } },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Updated stock",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean" },
                                    product: productSchema,
                                },
                            },
                        },
                    },
                },
            },
        },
    };

    paths[`/${marketplace}/orders`] = {
        post: {
            tags: ["Orders"],
            summary: `Create a ${marketplace} order`,
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            oneOf: [
                                {
                                    type: "object",
                                    required: ["model_sku", "qty"],
                                    properties: {
                                        model_sku: { type: "string" },
                                        qty: { type: "integer" },
                                    },
                                },
                                {
                                    type: "object",
                                    required: ["sku", "quantity"],
                                    properties: {
                                        sku: { type: "string" },
                                        quantity: { type: "integer" },
                                    },
                                },
                                {
                                    type: "object",
                                    required: ["seller_sku", "quantity"],
                                    properties: {
                                        seller_sku: { type: "string" },
                                        quantity: { type: "integer" },
                                    },
                                },
                            ],
                        },
                        examples: orderCreateExamples,
                    },
                },
            },
            responses: {
                201: {
                    description: "Created order",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean" },
                                    order: orderSchema,
                                    webhook: {
                                        type: "object",
                                        properties: {
                                            status: { type: "string" },
                                            webhookUrl: { type: "string" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },

    };

    paths[`/${marketplace}/orders/{id}`] = {
        get: {
            tags: ["Orders"],
            summary: `Get a ${marketplace} order by id`,
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                },
            ],
            responses: {
                200: {
                    description: "Order detail",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean" },
                                    order: orderSchema,
                                },
                            },
                        },
                    },
                },
            },
        },
    };

    paths[`/${marketplace}/my-orders`] = {
        get: {
            tags: ["Orders"],
            summary: `List authenticated user orders for ${marketplace}`,
            security: [{ BearerAuth: [] }],
            responses: {
                200: {
                    description: "My orders",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean" },
                                    orders: {
                                        type: "array",
                                        items: orderSchema,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    };

    paths[`/${marketplace}/simulate-error`] = {
        post: {
            tags: ["Operations"],
            summary: `Simulate marketplace error for ${marketplace}`,
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["type"],
                            properties: {
                                type: {
                                    type: "string",
                                    enum: Object.values(ERROR_TYPES),
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Simulation accepted",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean" },
                                    simulation: {
                                        type: "object",
                                        properties: {
                                            marketplace: {
                                                type: "string",
                                                enum: MARKETPLACES,
                                            },
                                            type: {
                                                type: "string",
                                                enum: Object.values(
                                                    ERROR_TYPES,
                                                ),
                                            },
                                            enabled: { type: "boolean" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    };

    return paths;
}, {});

export default {
    openapi: "3.1.0",
    info: {
        title: "Mock Multi-Marketplace API",
        version: "1.0.0",
        description:
            "Swagger documentation for the mock Shopee, Tokopedia, and Lazada backend.",
    },
    servers: [{ url: baseServerUrl, description: "Local development server" }],
    tags: [
        { name: "Auth" },
        { name: "Products" },
        { name: "Orders" },
        { name: "Operations" },
        { name: "Webhooks" },
        { name: "System" },
    ],
    components: {
        securitySchemes: {
            BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
            InternalSecret: {
                type: "apiKey",
                in: "header",
                name: "X-Internal-Secret",
            },
        },
    },
    paths: {
        "/health": {
            get: {
                tags: ["System"],
                summary: "Health check",
                responses: { 200: { description: "OK" } },
            },
        },
        "/auth/register": {
            post: {
                tags: ["Auth"],
                summary: "Register a new user",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["name", "email", "password"],
                                properties: {
                                    name: { type: "string" },
                                    email: { type: "string" },
                                    password: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: { 201: { description: "Registered successfully" } },
            },
        },
        "/auth/login": {
            post: {
                tags: ["Auth"],
                summary: "Login user",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password"],
                                properties: {
                                    email: { type: "string" },
                                    password: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: { 200: { description: "Login successful" } },
            },
        },
        "/auth/me": {
            get: {
                tags: ["Auth"],
                summary: "Get authenticated user profile",
                security: [{ BearerAuth: [] }],
                responses: { 200: { description: "Authenticated user" } },
            },
        },
        "/webhooks/{marketplace}": {
            post: {
                tags: ["Webhooks"],
                summary: "Receive marketplace order webhook (sent automatically on order creation)",
                description: "This endpoint is called automatically by the mock marketplace when an order is created. Each marketplace sends a different payload format.",
                parameters: [
                    {
                        name: "marketplace",
                        in: "path",
                        required: true,
                        schema: { type: "string", enum: MARKETPLACES },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { type: "object" },
                            examples: {
                                shopee: {
                                    summary: "Shopee ORDER_CREATED payload",
                                    value: {
                                        shop_id: 123456,
                                        code: 3,
                                        timestamp: 1717430400,
                                        data: {
                                            ordersn: "SP001",
                                            status: "UNPAID",
                                            update_time: 1717430400,
                                            sku: "SHP-IPH15PRO",
                                            qty: 1,
                                        },
                                    },
                                },
                                tokopedia: {
                                    summary: "Tokopedia ORDER_CREATED payload",
                                    value: {
                                        fs_id: 123456,
                                        shop_id: 9876543,
                                        invoice_num: "TK001",
                                        order_status: 220,
                                        payment_id: 98765,
                                        products: [
                                            {
                                                sku: "TOK-IPH15PRO",
                                                price: 18000000,
                                                quantity: 1,
                                            },
                                        ],
                                    },
                                },
                                lazada: {
                                    summary: "Lazada ORDER_CREATED payload",
                                    value: {
                                        message_type: 0,
                                        site_id: "ID",
                                        seller_id: "100123456",
                                        timestamp: 1717430400,
                                        data: {
                                            trade_order_id: "LZ001",
                                            order_status: "pending",
                                            buyer_id: 554433,
                                            trade_order_lines: [
                                                {
                                                    order_item_id: 987654321,
                                                    sku: "LZD-IPH15PRO",
                                                    quantity: 1,
                                                },
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Webhook received and logged",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: { type: "boolean" },
                                        received: { type: "boolean" },
                                        log: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string" },
                                                marketplace: { type: "string" },
                                                event_type: { type: "string", example: "ORDER_CREATED" },
                                                status: { type: "string", example: "RECEIVED" },
                                                createdAt: { type: "string", format: "date-time" },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        ...marketplacePaths,
    },
};
