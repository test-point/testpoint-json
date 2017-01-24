var express = require('express');
var router = express.Router();
var fs = require('fs');
var parseString = require('xml2js').parseString;
var UnMarshaller = require('../../scripts/unmarshaller')
var Marshaller = require('../../scripts/marshaller')

var unmarshallerInvoice = new UnMarshaller('../resources/CoreInvoice/');
var unmarshallerResponse = new UnMarshaller('../resources/Response/');
var marshallerInvoice = new Marshaller('../resources/CoreInvoice/');
var marshallerResponse = new Marshaller('../resources/Response/');

router.post('/json2ubl', function (req, res, next) {
    if(req.body.ubljson) {
        var result;
        var document = JSON.parse(req.body["ubljson"]);
        if(document["Invoice"]){
            var result = marshallerInvoice.marshalString(req.body.ubljson, true);
        } else if (document["ApplicationResponse"]) {
            var result = marshallerResponse.marshalString(req.body.ubljson, true);
        }

        if(result) {
            res.setHeader('content-type', 'application/xml');
            res.end(result);
        }
        else {
            var err = new Error('Unexpected document type received.');
            err.status = 422;
            next(err);
        }
    } else {
        var err = new Error('The body parameter \'ubljson\' is required.');
        err.status = 422;
        next(err);
    }
});

router.all('/json2ubl', function (req, res, next) {
    var err = new Error('HTTP method ' + req.method +' is not supported by this URL.');
    err.status = 405;
    next(err);

});

router.post('/ubl2json', function (req, res, next) {
    if(req.body.ublxml) {
        var ns;
        parseString(req.body.ublxml, function (err, result) {
            for(i in result) {
                if(i.indexOf(":") != -1) {
                    var prefix = i.substring(0, i.indexOf(":"));
                    ns = result[i]['$']['xmlns:' + prefix];
                }/*
                TODO: documents without ns are failed to be un-marshalled
                else {
                    ns = result[i]['$']['xmlns:xsi'];
                }*/
            }
        });
        var result;
        var schemaLink;
        if(ns == "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"){
            result = unmarshallerInvoice.unmarshalString(req.body.ublxml, true);
            schemaLink = "https://raw.githubusercontent.com/ausdigital/ausdigital-bill/master/spec/v1.0.0/Invoice.json"
        } else if (ns == "urn:oasis:names:specification:ubl:schema:xsd:ApplicationResponse-2") {
            result = unmarshallerResponse.unmarshalString(req.body.ublxml, true);
            schemaLink = "https://raw.githubusercontent.com/ausdigital/ausdigital-bill/master/spec/v1.0.0/Response.json"
        }
        if(result) {
            res.setHeader('Link', '<'+schemaLink+'>; rel="describedby"');
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify(result));
        }
        else {
            var err = new Error('Unexpected document type received.');
            err.status = 422;
            next(err);
        }

    } else {
        var err = new Error('The body parameter \'ublxml\' is required.');
        err.status = 422;
        next(err);
    }
});

router.all('/ubl2json', function (req, res, next) {
    var err = new Error('HTTP method ' + req.method +' is not supported by this URL.');
    err.status = 405;
    next(err);

});



module.exports = router;
