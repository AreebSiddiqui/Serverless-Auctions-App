import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { getAuctionById } from "./getAuction";
import placeBidSchema from "../lib/schemas/placeBidSchema";
import validator from "@middy/validator";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
async function placeBid(event, context) {
	const { id } = event.pathParameters;
	const { amount } = event.body;
	const {email} = event.requestContext.authorizer;
	const auctionId = await getAuctionById(id);

	if(email === auctionId.seller) {
		throw new createError.Forbidden(`You cannot bid on your own auctions!`)
	}

	if(email === auctionId.highestBid.bidder) {
		throw new createError.Forbidden(`You are already a highest bidder!`)

	}



	const params = {
		TableName: process.env.AUCTIONS_TABLE_NAME,
		Key: { id },
		UpdateExpression: "set highestBid.amount = :amount, highestBid.bidder= :bidder",
		ExpressionAttributeValues: {
			":amount": amount,
			":bidder": email,
		},
		ReturnValues: "ALL_NEW",
	};


	if (auctionId.status !== "OPEN") {
		throw new createError.Forbidden(`You cannot bid on closed auctions`);
	}
	if (amount <= auctionId.highestBid.amount) {
		throw new createError.Forbidden(
			`You cant bid low than ${auctionId.highestBid.amount}!`
		);
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

export const handler = commonMiddleware(placeBid).use(validator({inputSchema: placeBidSchema}));
