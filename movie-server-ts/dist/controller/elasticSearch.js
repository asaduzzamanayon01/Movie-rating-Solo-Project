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
const { PrismaClient } = require("@prisma/client");
const { Client: ElasticsearchClient } = require("@elastic/elasticsearch");
// Initialize Elasticsearch client
const esClient = new ElasticsearchClient({
    node: "http://localhost:9200",
    auth: {
        username: "elastic",
        password: "I16omnzaK0sHB8mj4YEL",
    },
});
// Initialize Prisma client
const prisma = new PrismaClient();
const BATCH_SIZE = 10000; // Adjust the batch size as needed
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield esClient.ping();
            console.log("Connected to Elasticsearch.");
            const totalCount = yield prisma.movie.count();
            console.log(`Total movies to process: ${totalCount}`);
            for (let offset = 0; offset < totalCount; offset += BATCH_SIZE) {
                const movies = yield prisma.movie.findMany({
                    skip: offset,
                    take: BATCH_SIZE,
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        image: true,
                        releaseDate: true,
                        duration: true,
                        createdBy: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                });
                if (movies.length > 0) {
                    const body = movies.flatMap((movie) => [
                        { index: { _index: "movies", _id: movie.id.toString() } },
                        {
                            title: movie.title,
                            description: movie.description,
                            image: movie.image,
                            releaseDate: movie.releaseDate,
                            duration: movie.duration,
                            createdBy: movie.createdBy,
                            createdAt: movie.createdAt,
                            updatedAt: movie.updatedAt,
                        },
                    ]);
                    let bulkResponse;
                    try {
                        bulkResponse = yield esClient.bulk({
                            refresh: true,
                            body,
                        });
                    }
                    catch (bulkError) {
                        console.error("Error during bulk insert:", bulkError);
                        continue; // Skip this batch if bulk insert fails
                    }
                    if (bulkResponse && bulkResponse.errors) {
                        console.error("Errors occurred during bulk insert:", bulkResponse.errors);
                    }
                    else {
                        console.log(`Inserted ${movies.length} movies.`);
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
            yield prisma.$disconnect();
            console.log("Prisma connection closed.");
        }
    });
}
run().catch(console.error);
