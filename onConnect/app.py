import boto3, os, json

def handler(event, context):

    ddb = boto3.client("dynamodb")

    # new connection
    try:
        ddb.put_item(TableName=os.environ['connections_table'],
                    Item={'connectionId': {'S': event['requestContext']['connectionId']} })
    except Exception as e:
        print(e)
        return {'statusCode': 500, 'body': 'Failed to connect'}

    return {'statusCode':200, 'body': 'OK'}
