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
        if(ns == "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"){
            result = unmarshallerInvoice.unmarshalString(req.body.ublxml, true);
        } else if (ns == "urn:oasis:names:specification:ubl:schema:xsd:ApplicationResponse-2") {
            result = unmarshallerResponse.unmarshalString(req.body.ublxml, true);
        }
        if(result) {
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

module.exports = router;
