<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],
    
    // Or if you want to be specific:
    // 'allowed_origins' => [
    //     'http://localhost:3000',
    //     'http://localhost:5173',
    //     'http://localhost:8080',
    //     'http://127.0.0.1:3000',
    //     'http://127.0.0.1:5173',
    // ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Content-Type', 'Authorization'],

    'max_age' => 0,

    'supports_credentials' => true,

];
