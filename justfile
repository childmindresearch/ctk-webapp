build-api:
   just --justfile {{justfile_directory()}}/ctk-functions/justfile 
   npx openapi-typescript ./ctk-functions/openapi.json -o ./src/lib/server/ctk_functions/types.d.ts
   
