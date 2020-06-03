import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
async function getAuctions(event, context) {
	const { status } = event.queryStringParameters;
	let auctions;
	const params = {
		TableName: process.env.AUCTIONS_TABLE_NAME,
		IndexName: 'StatusAndEndDate',
		KeyConditionExpression: "#status = :status",
		ExpressionAttributeValues: {
			":status": status,
		},
		ExpressionAttributeNames: {
			"#status": "status",
		},
	};

	try {
		const result = await dynamoDb.query(params).promise();
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

export const handler = commonMiddleware(getAuctions);
