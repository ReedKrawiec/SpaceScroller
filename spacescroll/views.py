from django.http import HttpResponse
from django.template import loader
import requests
import json

def index(request):
  template = loader.get_template('spacescroll/index.html')
  return HttpResponse(template.render({},request))

def requestUrl(request):
  headers = {'User-Agent' : 'SpaceScroller'}
  num = request.GET.get('num')
  after = request.GET.get('after')
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
    return HttpResponse(json.dumps(finalObj))
  elif r.status_code == 404:
    finalObj = {'error':1}
    return HttpResponse(json.dumps(finalObj))

