from flask import Flask
from flask import request
import requests
import json

app = Flask(__name__)

@app.route('/')
def hello_world():
    return app.send_static_file('html/index.html')

@app.route('/requestUrl')
def requestUrl():
  headers = {'User-Agent' : 'SpaceScroller'}
  num = request.args.get('num')
  after = request.args.get('after')
  if num == None:
    num = "0"
    print("hello")
  else:  
    try:
      float(num)
    except ValueError:
      num = "0" 
  if after == None:
    after = "0"
  print("num:"+num + " after:"+after)    
  url = 'https://www.reddit.com/r/spaceporn.json?count='+num+"&after="+after 
  r = requests.get(url,headers = headers)
  if r.status_code == 200:
    content = r.json()['data']
    after = content['after'] #used for accessing the next page of data
    nextNum = str(int(num) + 25)
    finalObj = {'error':0,'after':after,'num':nextNum}
    dataList = [] 
    for thread in content['children']:
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

@app.route('/static/<path:path>')
def send_js(path):
    return "meme" + path   
"""
@app.route('/static/<path:path>')
def catch_all(path):
    return 'You want path: %s' % path 
"""