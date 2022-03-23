import boto3, os, json


def handler(event, context):
    print(event)
    ddb = boto3.client('dynamodb')
    # insert message to DB
    body = json.loads(event['body'])
    try:
        ddb.put_item(
                    TableName=os.environ['messages_table'],
                    Item={
                        'time': {'S': body['time']},
                        'from': {'S': body['from']},
                        'message': {'S': body['message']}
                    })
    except Exception as e:
        print(e)
        return {'statusCode': 500, 'body': 'Failed to connect'}

    apiGwSocket = boto3.client('apigatewaymanagementapi', endpoint_url= 'https://' + event['requestContext']['domainName']+ '/' + event['requestContext']['stage'])
    # get connection info
    try:
        connectionData = ddb.scan(TableName=os.environ['connections_table'], ProjectionExpression='connectionId')
    except Exception as e:
        print(e)
        return {'statusCode': 500}
    # send data to client
    for connection in connectionData['Items']: 
        if event['requestContext']['connectionId'] == connection['connectionId']['S']:
            continue
        try:
            apiGwSocket.post_to_connection(ConnectionId=connection['connectionId']['S'], Data=json.dumps(body))
        except apiGwSocket.exceptions.GoneException as e:
            print(e)
            print('stale connection')
            ddb.delete_item(TableName = os.environ['connections_table'], Key={'connectionId': {'S': connection['connectionId']['S']}})
    return {'statusCode': 200, 'body': 'Data sent'}