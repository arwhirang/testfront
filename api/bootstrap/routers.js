var backendIpAdress = 'http://121.100.89.29';//163.87

var request = require('request');

var escapeRegExp = function(str)
{
  var specials = [
    "-"
    , "["
    , "]"
    // order doesn't matter for any of these
    , "/"
    , "{"
    , "}"
    , "("
    , ")"
    , "*"
    , "+"
    , "?"
    , "."
    , "\\"
    , "^"
    , "$"
    , "|"
  ], regex = RegExp('[' + specials.join('\\') + ']', 'g');

  return str.replace(regex, "\\$&");
};

module.exports = function(app, config)
{

  app.get('/', function(req, res)
  {
    res.render('index');
  });

  app.get('/var', function(req, res)
  {
    var fs = require('fs');
    fs.readFile("public/html/var.html", function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      res.end();
    });
  });

  app.get('/var_thesecond', function(req, res)
  {
    var fs = require('fs');
    fs.readFile("public/html/var_thesecond.html", function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      res.end();
    });
  });

  app.get('/advSearch', function(req, res)
  {
    p = req.query.p;
    if(!p) p=1;
    if(!isNaN(p)){
      // returns true if p does NOT contain a valid number
      // number: false / string: true
      p = 1*p;
      if(p <= 1) p=1;
    }

    itemPerPage = 20;

    mQuery = req.query.m;
    gQuery = req.query.g;
    dQuery = req.query.d;
    pmQuery = req.query.pm;
    diQuery = req.query.di;

    query = "PMIDinfo="+pmQuery+"&GENE="+gQuery+"&DISEASE="+diQuery+"&MUTATION="+mQuery+"&DRUG="+dQuery;

    request.get(backendIpAdress+':8089/ADVsearch?' + query, function(err, response, body)
    {
      if(!err)
      {
        try{
          JSON.parse(body);
        }catch(_err){
          console.log('pars');
          console.log(_err);
          res.json({result: false, message: "Parse error"});
          return;
        }
        if(JSON.parse(body)["error"])
        {
          res.json({result: false, message: "Got error"});
        }else
        {
          parsed = JSON.parse(body);
          if(parsed.length == 0)
          {
            result = {
              'status': 'Success',
              'message': 'No results. For the graph UI, It is required to give only one entity.',
              'query': query
            };
            res.render('notfound', result);
          }else
          {
            //change names appeared in the sentence with special tags
            for(var i=0; i<parsed.length; i++)
            {
              s = parsed[i]["Sentence"];
              pattern = new RegExp(escapeRegExp(parsed[i]["Mutation"]["MutName"]), 'gi');
              s = s.replace(pattern, "<span class='mut_span'>"+parsed[i]["Mutation"]["MutName"]+"</span>");
              pattern = new RegExp(escapeRegExp(parsed[i]["Gene"]["GeneName"]), 'g');
              s = s.replace(pattern, "<span class='gene_span'>"+parsed[i]["Gene"]["GeneName"]+"</span>");
              pattern = new RegExp(escapeRegExp(parsed[i]["Drug"]["DrugName"]), 'gi');
              if(parsed[i]["Drug"]["DrugName"]!= "")
                s = s.replace(pattern, "<span class='drug_span'>"+parsed[i]["Drug"]["DrugName"]+"</span>");
              pattern = new RegExp(escapeRegExp(parsed[i]["Disease"]["DiseaseName"]), 'gi');
              if(parsed[i]["Disease"]["DiseaseName"]!= "")
                s = s.replace(pattern, "<span class='disease_span'>" + parsed[i]["Disease"]["DiseaseName"] + "</span>");
              parsed[i]["Sentence"] = s;
            }

            totalSize = parsed.length;
            lastPage = Math.ceil(totalSize/itemPerPage);
            firstPage = 1;
            if(p == "last") p = lastPage;
            else if(p == "first") p = firstPage;

            if(p >= Math.ceil(parsed.length/itemPerPage)) p= Math.ceil(parsed.length/itemPerPage);
            currpIdx = p-1;

            minPage = Math.max(1, p-4);
            if(lastPage <= minPage+9)
            {
              maxPage = lastPage;
              minPage = Math.max(maxPage-9, 1);
            }else
            {
              maxPage = minPage+9;
            }
            //  maxPage = Math.min(lastPage, minPage+9);

            pageToShow = [];
            for(var k=minPage; k<=maxPage; k++)
            {
              pageToShow.push(k);
            }

            parsed = parsed.slice(currpIdx*itemPerPage, Math.min((currpIdx+1)*itemPerPage, parsed.length));
            result = 
            {
              'status': "Success",
              'message': "Hits " + (1*(currpIdx*itemPerPage)+1) + " - " + (Math.min((currpIdx +1) * itemPerPage, totalSize)) + " (out of " + totalSize + " results)",
              'query': query,
              'results': parsed,
              'curPage': p,
              'pages': pageToShow,
              'mQuery': mQuery,
              'gQuery': gQuery,
              'dQuery': dQuery,
              'pmQuery': pmQuery,
              'diQuery': diQuery
            }
            if(minPage != 1)
            {
              // show first page
              result['firstPage'] = 1;
            }else{
              result['firstPage'] = "Nope";
            }
            if(maxPage != lastPage)
            {
              // show last page
              result['lastPage'] = lastPage;
            }else{
              result['lastPage'] = "Nope";
            }
            res.render('advsearch', result);
          }
        }
      }else
      {
        res.json({result: false, message: "Connection_to_DB error"});
      }
    });
  });

  app.get('/search', function(req, res)
  {
    query = req.query.q;
    p = req.query.p;
    if(!p) p=1;
    if(!isNaN(p)){
      // returns true if p does NOT contain a valid number
      // number: false / string: true
      p = 1*p;
      if(p <= 1) p=1;
    }

    itemPerPage = 20;

    request.get(backendIpAdress+':8089/DB?Query=' + query, function(err, response, body)
    {
      if(!err)
      {
        try{
          JSON.parse(body);
        }catch(_err){
          console.log('pars');
          console.log(_err);
          res.json({result: false, message: "Parse error"});
          return;
        }
        if(JSON.parse(body)["error"])
        {
          res.json({result: false, message: "Got error"});
        }else
        {
          parsed = JSON.parse(body);
          if(parsed.length == 0)
          {
            result = {
              'status': 'Success',
              'message': 'No results. For the graph UI, It is required to give only one entity.',
              'query': query
            };
            res.render('notfound', result);
          }else
          {
            //change names appeared in the sentence with special tags
            for(var i=0; i<parsed.length; i++)
            {
              s = parsed[i]["Sentence"];
              pattern = new RegExp(escapeRegExp(parsed[i]["Mutation"]["MutName"]), 'gi');
              s = s.replace(pattern, "<span class='mut_span'>"+parsed[i]["Mutation"]["MutName"]+"</span>");
              pattern = new RegExp(escapeRegExp(parsed[i]["Gene"]["GeneName"]), 'g');
              s = s.replace(pattern, "<span class='gene_span'>"+parsed[i]["Gene"]["GeneName"]+"</span>");
              pattern = new RegExp(escapeRegExp(parsed[i]["Drug"]["DrugName"]), 'gi');
              if(parsed[i]["Drug"]["DrugName"]!= "")
                s = s.replace(pattern, "<span class='drug_span'>"+parsed[i]["Drug"]["DrugName"]+"</span>");
              pattern = new RegExp(escapeRegExp(parsed[i]["Disease"]["DiseaseName"]), 'gi');
              if(parsed[i]["Disease"]["DiseaseName"]!= "")
                s = s.replace(pattern, "<span class='disease_span'>" + parsed[i]["Disease"]["DiseaseName"] + "</span>");
              parsed[i]["Sentence"] = s;
            }

            totalSize = parsed.length;
            lastPage = Math.ceil(totalSize/itemPerPage);
            firstPage = 1;
            if(p == "last") p = lastPage;
            else if(p == "first") p = firstPage;

            if(p >= Math.ceil(parsed.length/itemPerPage)) p= Math.ceil(parsed.length/itemPerPage);
            currpIdx = p-1;

            minPage = Math.max(1, p-4);
            if(lastPage <= minPage+9)
            {
              maxPage = lastPage;
              minPage = Math.max(maxPage-9, 1);
            }else
            {
              maxPage = minPage+9;
            }
            //  maxPage = Math.min(lastPage, minPage+9);

            pageToShow = [];
            for(var k=minPage; k<=maxPage; k++)
            {
              pageToShow.push(k);
            }

            parsed = parsed.slice(currpIdx*itemPerPage, Math.min((currpIdx+1)*itemPerPage, parsed.length));
            result = 
            {
              'status': "Success",
              'message': "Hits " + (1*(currpIdx*itemPerPage)+1) + " - " + (Math.min((currpIdx +1) * itemPerPage, totalSize)) + " (out of " + totalSize + " results)",
              'query': query,
              'results': parsed,
              'curPage': p,
              'pages': pageToShow
            }
            if(minPage != 1)
            {
              // show first page
              result['firstPage'] = 1;
            }else
            {
              result['firstPage'] = "Nope";
            }
            if(maxPage != lastPage)
            {
              // show last page
              result['lastPage'] = lastPage;
            }else
            {
              result['lastPage'] = "Nope";
            }
            res.render('search', result);
          }
        }
      }else
      {
        // Error
        res.json({result: false, message: "Connection_to_DB error"});
      }
      
      
    });
  });

  app.get('/graph', function(req, res)
  {
    query = req.query.q;
    p = req.query.p;
    if(!p) p=1;
    if(!isNaN(p)){
      // returns true if p does NOT contain a valid number
      // number: false / string: true
      p = 1*p;
      if(p <= 1) p=1;
    }

    itemPerPage = 20;

    request.get(backendIpAdress+':8089/Graph?Query=' + query, function(err, response, body)
    {
      if(!err)
      {
        try{
          JSON.parse(body);
        }catch(_err){
          console.log('pars');
          console.log(_err);
          res.json({result: false, message: "Parse error"});
          return;
        }
        if(JSON.parse(body)["error"])
        {
          res.json({result: false, message: "Got error"});
        }else
        {
          parsed = JSON.parse(body);
          //console.log(parsed);
          //console.log(parsed.length);
          if(parsed.length==0)
          {
            result = 
            {
              'status': 'Success',
              'message': 'No results. For the graph UI, It is required to give only one entity.',
              'query': query
            };
            res.render('notfound', result);
          }else if(parsed.hasOwnProperty("nodes"))
          {
            if(parsed.nodes.length==0)
            {
              result = 
              {
                'status': 'Success',
                'message': 'No results. For the graph UI, It is required to give only one entity.',
                'query': query
              };
              res.render('notfound', result);
            }else
            {
              totalSize = parsed.length;
              lastPage = Math.ceil(totalSize/itemPerPage);
              firstPage = 1;
              if(p == "last") p = lastPage;
              else if(p == "first") p = firstPage;
              if(p >= Math.ceil(parsed.length/itemPerPage)) p= Math.ceil(parsed.length/itemPerPage);
              currpIdx = p-1;
  
              minPage = Math.max(1, p-4);
              if(lastPage <= minPage+9)
              {
                maxPage = lastPage;
                minPage = Math.max(maxPage-9, 1);
              }else
              {
                maxPage = minPage+9;
              }
              //  maxPage = Math.min(lastPage, minPage+9);
              pageToShow = [];
              for(var k=minPage; k<=maxPage; k++)
              {
                pageToShow.push(k);
              }
              result = 
              {
                'status': "Success",
                'message': "Hits " + (1*(currpIdx*itemPerPage)+1) + " - " + (Math.min((currpIdx +1) * itemPerPage, totalSize)) + " (out of " + totalSize + " results)",
                'query': query,
                'results': parsed,
                'curPage': p,
                'pages': pageToShow
              }
              if(minPage != 1)
              {
                // show first page
                result['firstPage'] = 1;
              }else
              {
                result['firstPage'] = "Nope";
              }
              if(maxPage != lastPage)
              {
                // show last page
                result['lastPage'] = lastPage;
              }else
              {
                result['lastPage'] = "Nope";
              }
              res.render('graph', result);
            }
          }else
          {
            result = 
            {
              'status': 'Success',
              'message': 'No results. For the graph UI, It is required to give only one entity.',
              'query': query
            };
            res.render('notfound', result);
          }
        }
      }else
      {
        // Error
        res.json({result: false, message: "Connection_to_DB error"});
      }
      
      
    });
  });

  
  app.get('/advGraph', function(req, res)
  {
    query = req.query.q;
    p = req.query.p;
    if(!p) p=1;
    if(!isNaN(p)){
      // returns true if p does NOT contain a valid number
      // number: false / string: true
      p = 1*p;
      if(p <= 1) p=1;
    }

    itemPerPage = 20;
    fQuery = req.query.f;//first
    sQuery = req.query.s;//second

    query = "FIRST="+fQuery+"&SECOND="+sQuery;
    request.get(backendIpAdress+':8089/ADVgraph?' + query, function(err, response, body)
    {
      if(!err)
      {
        try{
          JSON.parse(body);
        }catch(_err){
          console.log('pars');
          console.log(_err);
          res.json({result: false, message: "Parse error"});
          return;
        }
        if(JSON.parse(body)["error"])
        {
          res.json({result: false, message: "Got error"});
        }else
        {
          parsed = JSON.parse(body);
          //console.log(parsed);
          //console.log(parsed.length);
          if(parsed.length==0)
          {
            result = 
            {
              'status': 'Success',
              'message': 'No results. For the graph UI, It is required to give only one entity.',
              'query': query
            };
            res.render('notfound', result);
          }else if(parsed.hasOwnProperty("nodes"))
          {
            if(parsed.nodes.length==0)
            {
              result = 
              {
                'status': 'Success',
                'message': 'No results. For the graph UI, It is required to give only one entity.',
                'query': query
              };
              res.render('notfound', result);
            }else
            {
              totalSize = parsed.length;
              lastPage = Math.ceil(totalSize/itemPerPage);
              firstPage = 1;
              if(p == "last") p = lastPage;
              else if(p == "first") p = firstPage;
              if(p >= Math.ceil(parsed.length/itemPerPage)) p= Math.ceil(parsed.length/itemPerPage);
              currpIdx = p-1;
  
              minPage = Math.max(1, p-4);
              if(lastPage <= minPage+9)
              {
                maxPage = lastPage;
                minPage = Math.max(maxPage-9, 1);
              }else
              {
                maxPage = minPage+9;
              }
              pageToShow = [];
              for(var k=minPage; k<=maxPage; k++)
              {
                pageToShow.push(k);
              }
              result = 
              {
                'status': "Success",
                'message': "Hits " + (1*(currpIdx*itemPerPage)+1) + " - " + (Math.min((currpIdx +1) * itemPerPage, totalSize)) + " (out of " + totalSize + " results)",
                'query': query,
                'results': parsed,
                'curPage': p,
                'pages': pageToShow
              }
              if(minPage != 1)
              {
                // show first page
                result['firstPage'] = 1;
              }else
              {
                result['firstPage'] = "Nope";
              }
              if(maxPage != lastPage)
              {
                // show last page
                result['lastPage'] = lastPage;
              }else
              {
                result['lastPage'] = "Nope";
              }
              res.render('graph', result);
            }
          }else
          {
            result = 
            {
              'status': 'Success',
              'message': 'No results. For the graph UI, It is required to give only one entity.',
              'query': query
            };
            res.render('notfound', result);
          }
        }
      }else
      {
        // Error
        res.json({result: false, message: "Connection_to_DB error"});
      }
      
      
    });
  });

};
