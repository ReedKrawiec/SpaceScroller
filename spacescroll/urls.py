from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^requestUrl',views.requestUrl,name='requestUrl'),
    url(r'', views.index, name='index')
]