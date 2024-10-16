"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const { Client: ElasticsearchClient } = require("@elastic/elasticsearch");
const db_config_1 = __importDefault(require("./DB/db.config"));
const esClient = new ElasticsearchClient({
    node: "http://localhost:9200/",
    //   auth: {
    //     username: "elastic",
    //     password: "I16omnzaK0sHB8mj4YEL",
    //   },
    tls: {
        rejectUnauthorized: false,
    },
});
const BATCH_SIZE = 10000; // Adjust the batch size as needed
function createIndex() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const indexExists = yield esClient.indices.exists({ index: "movies" });
            if (!indexExists) {
                yield esClient.indices.create({
                    index: "movies",
                    body: {
                        mappings: {
                            properties: {
                                title: { type: "text" },
                                image: { type: "text" },
                                description: { type: "text" },
                                releaseDate: { type: "integer" },
                                createdBy: { type: "integer" },
                                createdAt: { type: "date" },
                            },
                        },
                    },
                });
                console.log("Index created: movies");
            }
        }
        catch (error) {
            console.error("Error creating index:", error);
        }
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield esClient.ping();
            console.log("Connected to Elasticsearch.");
            // Create index if it doesn't exist
            yield createIndex();
            const totalCount = yield db_config_1.default.movie.count();
            console.log(`Total movies to process: ${totalCount}`);
            for (let offset = 0; offset < totalCount; offset += BATCH_SIZE) {
                const movies = yield db_config_1.default.movie.findMany({
                    skip: offset,
                    take: BATCH_SIZE,
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                        genres: {
                            include: {
                                genre: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                });
                if (movies.length > 0) {
                    const body = movies.flatMap((movie) => [
                        { index: { _index: "movies", _id: movie.id.toString() } },
                        {
                            title: movie.title,
                            image: movie.image,
                            description: movie.description,
                            releaseDate: movie.releaseDate,
                            createdBy: movie.createdBy,
                            createdAt: new Date().toISOString(),
                            genres: movie.genres.map((g) => g.genre.name), // Adjust based on how you want to store genres
                        },
                    ]);
                    if (body.length) {
                        const bulkResponse = yield esClient.bulk({
                            refresh: true,
                            body,
                        });
                        if (bulkResponse.errors) {
                            console.error("Errors occurred during bulk insert:", bulkResponse.errors);
                        }
                        else {
                            console.log(`Inserted ${movies.length} movies.`);
                        }
                    }
                }
                else {
                    console.log("No more movies to process.");
                    break;
                }
            }
        }
        catch (error) {
            console.error("Error occurred:", error);
        }
        finally {
            yield db_config_1.default.$disconnect();
            console.log("Database connection closed.");
        }
    });
}
run().catch(console.error);
// const { Client: ElasticsearchClient } = require("@elastic/elasticsearch");
// import prisma from "./DB/db.config";
// const esClient = new ElasticsearchClient({
//   node: "https://localhost:9200/",
//   auth: {
//     username: "elastic",
//     password: "I16omnzaK0sHB8mj4YEL",
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });
// const BATCH_SIZE = 10000;
// async function createIndex() {
//   try {
//     const indexExists = await esClient.indices.exists({ index: "movies" });
//     if (!indexExists) {
//       await esClient.indices.create({
//         index: "movies",
//         body: {
//           mappings: {
//             properties: {
//               title: { type: "text" },
//               image: { type: "text" },
//               description: { type: "text" },
//               releaseDate: { type: "integer" },
//               createdBy: { type: "integer" },
//               createdAt: { type: "date" },
//             },
//           },
//         },
//       });
//       console.log("Index created: movies");
//     } else {
//       await esClient.indices.putMapping({
//         index: "movies",
//         body: {
//           properties: {
//             createdAt: { type: "date" },
//           },
//         },
//       });
//       console.log("Mapping updated: added createdAt field.");
//     }
//   } catch (error) {
//     console.error("Error creating or updating index:", error);
//   }
// }
// async function run() {
//   try {
//     await esClient.ping();
//     console.log("Connected to Elasticsearch.");
//     // Create index and update mapping if needed
//     await createIndex();
//     const totalCount = await prisma.movie.count();
//     console.log(`Total movies to process: ${totalCount}`);
//     for (let offset = 0; offset < totalCount; offset += BATCH_SIZE) {
//       const movies = await prisma.movie.findMany({
//         skip: offset,
//         take: BATCH_SIZE,
//         include: {
//           user: {
//             select: {
//               id: true,
//               firstName: true,
//               lastName: true,
//             },
//           },
//           genres: {
//             include: {
//               genre: {
//                 select: {
//                   id: true,
//                   name: true,
//                 },
//               },
//             },
//           },
//         },
//       });
//       if (movies.length > 0) {
//         const body = movies.flatMap((movie) => [
//           { update: { _index: "movies", _id: movie.id.toString() } },
//           {
//             doc: {
//               title: movie.title,
//               image: movie.image,
//               description: movie.description,
//               releaseDate: movie.releaseDate,
//               createdBy: movie.createdBy,
//               createdAt: new Date().toISOString(), // Set createdAt to the current date
//               genres: movie.genres.map((g) => g.genre.name),
//             },
//             upsert: {
//               title: movie.title,
//               image: movie.image,
//               description: movie.description,
//               releaseDate: movie.releaseDate,
//               createdBy: movie.createdBy,
//               createdAt: new Date().toISOString(),
//               genres: movie.genres.map((g) => g.genre.name),
//             },
//           },
//         ]);
//         if (body.length) {
//           const bulkResponse = await esClient.bulk({
//             refresh: true,
//             body,
//           });
//           if (bulkResponse.errors) {
//             console.error(
//               "Errors occurred during bulk update:",
//               bulkResponse.errors
//             );
//           } else {
//             console.log(`Updated ${movies.length} movies.`);
//           }
//         }
//       } else {
//         console.log("No more movies to process.");
//         break;
//       }
//     }
//   } catch (error) {
//     console.error("Error occurred:", error);
//   } finally {
//     await prisma.$disconnect();
//     console.log("Database connection closed.");
//   }
// }
// run().catch(console.error);
