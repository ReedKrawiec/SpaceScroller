from flask import Flask,request, redirect, url_for, session
from flask_cors import CORS,cross_origin
import requests
import json
import math


app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/')
def hello_world():
    return app.send_static_file('html/index.html')

@cross_origin()
@app.route('/requestUrl')
def requestUrl():
  headers = {'User-Agent' : 'SpaceScroller'}
  num = request.args.get('num')
  after = request.args.get('after')
  if num == None:
    num = "0"
  else:  
    try:
      float(num)
    except ValueError:
      num = "0" 
  if after == None:
    after = "0"
  num = int(num)  
  num_to_use = math.floor(num/25)*25
  url = 'https://www.reddit.com/r/spaceporn.json?count='+str(num_to_use)+"&after="+after 
  r = requests.get(url,headers = headers)
  if r.status_code == 200:
    objectVar = r.json()['data']
    content = objectVar['children']
    if((num+25)%25 == 0):
      after = objectVar['after'] #used for accessing the next page of data
    print(after)
    nextNum = num + 25
    finalObj = {'error':0,'after':after,'num':nextNum}
    dataList = [] 
    for thread in content:
      threadToAppend = {
        'title':thread['data']['title'],
        'url':thread['data']['url'],
        'redditUrl':thread['data']['permalink'],
        'poster':thread['data']['author']
      }
      dataList.append(threadToAppend)
    finalObj['data'] = dataList
    return json.dumps(finalObj)
  elif r.status_code == 404:
    finalObj = {'error':1}
    return json.dumps(finalObj)
