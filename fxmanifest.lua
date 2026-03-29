fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'yoskii_vehiclehud'
author 'Yoskii'
version '1.0.0'
description 'Advanced Vehicle HUD — fuel, damage, keys, hotwire, seatbelt & engine control'

dependencies {
    'ox_lib',
    'ox_inventory',
    'es_extended',
}

shared_scripts {
    '@ox_lib/init.lua',
    'config.lua',
}

client_scripts {
    'client.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server.lua',
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/style.css',
    'html/script.js',
}

dependency '/assetpacks'