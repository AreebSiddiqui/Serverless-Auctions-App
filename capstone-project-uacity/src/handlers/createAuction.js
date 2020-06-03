import AWS from "aws-sdk";
import { v4 as uuid } from "uuid";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
async function createAuction(event, context) {
	const { title } = event.body;
	const now = new Date();
	const userId = uuid();
	const endDate = new Date();
	endDate.setHours(now.getHours() +1 );
	const auction = {
		id: userId,
		title,
		status: "OPEN",
		createdAt: now.toISOString(),
		endDate: endDate.toISOString(),
		highestBid: { amount: 0 },
	};
	try {
		await dynamoDb
			.put({
				TableName: process.env.AUCTIONS_TABLE_NAME,
				Item: auction,
			})
			.promise();
	} catch (e) {
		console.error(e);
		throw new createError.InternalServerError(error);
	}
	return {
		statusCode: 201,
		body: JSON.stringify(auction),
	};
}

export const handler = commonMiddleware(createAuction);
