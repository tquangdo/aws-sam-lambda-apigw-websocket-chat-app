import boto3, os, json
from boto3.dynamodb.types import TypeDeserializer


#get messages
def handler(event, context):
    try:
        ddb = boto3.client('dynamodb')
        data = ddb.scan(TableName=os.environ['messages_table'], Limit=100)
        ret = [ddb_deserialize(item) for item in data['Items']]
        ret = sorted(ret, key=lambda k: k['time']) 
        return {
        'statusCode':200,
        'headers': {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*", 
            "Access-Control-Allow-Methods": "GET" 
        },
        'body': json.dumps(ret)}
    except Exception as e:
        print(e)
        return {'statusCode':500, 'body':'Failed to receive data'}
    
def ddb_deserialize(r, type_deserializer = TypeDeserializer()):
    return type_deserializer.deserialize({"M": r})