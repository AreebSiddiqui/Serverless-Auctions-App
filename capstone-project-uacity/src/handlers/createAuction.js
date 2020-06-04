import AWS from "aws-sdk";
import { v4 as uuid } from "uuid";
import commonMiddleware from "../lib/commonMiddleware";
import createAuctionSchema from '../lib/schemas/createAuctionSchema';
import validator from '@middy/validator'
import createError from "http-errors";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
async function createAuction(event, context) {
	const { title } = event.body;
	const {email} = event.requestContext.authorizer;
	const now = new Date();
	const userId = uuid();
	const endDate = new Date();
	endDate.setHours(now.getHours() +1 );
	const auction = {
		id: userId,
		title,
		status: "OPEN",
		createdAt: now.toISOString(),
		endingAt: endDate.toISOString(),
		highestBid: { amount: 0 },
		seller: email,
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

export const handler = commonMiddleware(createAuction)
	.use(validator({inputSchema: createAuctionSchema}))