import AWS from "aws-sdk";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpErrorHandler from "@middy/http-error-handler";
import createError from "http-errors";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
async function getAuctions(event, context) {
	let auctions;
	try {
		const result = await dynamoDb
			.scan({
				TableName: process.env.AUCTIONS_TABLE_NAME,
			})
			.promise();
		auctions = result.Items;
	} catch (e) {
		console.error(e);
		throw new createError.InternalServerError(error);
	}
	return {
		statusCode: 200,
		body: JSON.stringify(auctions),
	};
}

export const handler = middy(getAuctions)
	.use(httpJsonBodyParser())
	.use(httpEventNormalizer())
	.use(httpErrorHandler());
