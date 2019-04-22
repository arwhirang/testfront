exports.qStr_serialize = function(obj, prefix){
  var str = [];
  
  for(var p in obj){
    if(obj.hasOwnProperty(p)){
      var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
      str.push(typeof v == "object" ?
          serialize(v, k) :
          encodeURIComponent(k) + "=" + v);
    }
  }
  return str.join("&");
};

exports.get_remoteIP = function(req){
  var remoteIP = req.headers['X-Forwarded-For']
    || req.header['x-forwarded-for']
    || req.client.remoteAddress;

  return remoteIP;
}
