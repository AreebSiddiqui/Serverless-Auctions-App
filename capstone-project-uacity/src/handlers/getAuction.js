import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware"

import createError from "http-errors";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
async function getAuction(event, context) {
	let auction;
	let { id } = event.pathParameters;
	try {
		let result = await dynamoDb
			.get({
				TableName: process.env.AUCTIONS_TABLE_NAME,
                Key: {id}
			})
			.promise();
		auction = result.Item;
	} catch (e) {
		console.error(e);
		throw new createError.InternalServerError(error + `"${id}"`);
	}
    if (!auction) {
        throw new createError.NotFound(`No Item found with ID "${id}"`);
    }
	return {
		statusCode: 200,
		body: JSON.stringify(auction),
	};
}

export const handler = commonMiddleware(getAuction)
