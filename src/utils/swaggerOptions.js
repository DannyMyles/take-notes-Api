const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Totel API",
        version: "1.0.0",
        description: "API routes for techNotes app",
        contact: {
          name: "Muhad",
          email: "dannymyles@gmail.com"
        }
      },
      servers: [
        {
          url: "http://localhost:8081",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: ["./routes/*.js"],
  };
module.exports=swaggerOptions;  