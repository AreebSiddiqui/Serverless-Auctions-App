import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import {getAuctionById} from "./getAuction"
const dynamoDb = new AWS.DynamoDB.DocumentClient();
async function placeBid(event, context) {
	const { id } = event.pathParameters;
	const { amount } = event.body;
    const auctionId = await getAuctionById(id);
	const params = {
		TableName: process.env.AUCTIONS_TABLE_NAME,
		Key: { id },
		UpdateExpression: 'set highestBid.amount = :amount',
		ExpressionAttributeValues: {
			':amount': amount,
		},
		ReturnValues: "ALL_NEW",
	};
    if (amount <= auctionId.highestBid.amount){
        throw new createError.Forbidden(`You cant bid low than ${auctionId.highestBid.amount}!`)
    }
	let updatedAuction;
	try {
		const result = await dynamoDb.update(params).promise();
		updatedAuction = result.Attributes;
	} catch (e) {
		console.error(e);
		throw new createError.InternalServerError(error);
	}

	return {
		statusCode: 200,
		body: JSON.stringify(updatedAuction),
	};
}

export const handler = commonMiddleware(placeBid);
