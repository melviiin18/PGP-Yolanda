//var pgp_basemap_cache, google_satellite, osm, arcgis_world_imagery, bing_aerial, pgp_ortho_mm_cache	

Ext.define('mappanel',{
	extend:'GeoExt.panel.Map',
	alias:'Widget.mappanel',	
	title: "Philippine Geoportal - Yolanda (Haiyan) Map App",   			
	layout:'border',	
	region:'center',
	width:100,
	height:100,
	selLayer:'',
	execUrl:function(url, callback){
		Ext.Ajax.request({
				url:url,
				success: function(response){
					var obj = Ext.decode(response.responseText);					
					callback(obj)		
				}			
			});	
	
	},
	gCode:function(addr, callback){	  
				var geocoder = new google.maps.Geocoder();					
				geocoder.geocode({ 'address': addr + ' Philippines'}, function (results, status) {					
					if (status == google.maps.GeocoderStatus.OK) {		
						var xx=results[0].geometry.location.lng();			
						var yy=results[0].geometry.location.lat();		
						SourceDest={a:xx, b:yy};							
					}else{
						console.log("Geocoding failed: " + status); 
						Ext.Msg.alert("Geocoding failed", "Please enter location")
					}				
					callback(SourceDest);	
				})		
			},
	
	buildItems:function(){
		return[			
			{
				xtype:'textfield',
				itemId:'Search',
				width:200,
				emptyText:'Location Search',
			},{
				xtype:'button',
				text:'Go',
				itemId:'btnGo',
				//disabled:true,
				handler:function(){								
					var me=this.up();				
					var findThis = (me.getComponent('Search').getValue());					
					var me=this.up().up();					
					if  (me.map.getLayersByName('My Location').length > 0) {				
						me.map.getLayersByName('My Location')[0].destroy();					
					};	 				
					
					me.gCode(findThis, function(coord){					
						if  (me.map.getLayersByName('Gcode').length > 0) {				
							me.map.getLayersByName('Gcode')[0].destroy();					
						};		 				
						var currLoc = new OpenLayers.Geometry.Point(coord.a,coord.b).transform('EPSG:4326','EPSG:900913');
						var Location = new OpenLayers.Layer.Vector(	'Gcode', {
								 styleMap: new OpenLayers.StyleMap({'default':{										
										externalGraphic: "./chooser/icons/marker.png",				
										graphicYOffset: -25,
										graphicHeight: 35,
										graphicTitle: findThis
								}}), 	
								displayInLayerSwitcher: false,		
						});							
						Location.addFeatures([new OpenLayers.Feature.Vector(currLoc)]);						
						me.map.addLayer(Location);						
						me.map.zoomToExtent(Location.getDataExtent());			 		
					})						
				}			
			},			
			{	
				xtype:'button',
				tooltip:'My current location',
				name:'rb',				
				itemId:'btnLoc',
				scale:'large',				
				icon:'./chooser/icons/myCurrLoc.png',
				width:25,
				height:25,	
				handler:function(){					
					var me=this.up('panel');			
					console.log(me);
					if(me.map.getLayersByName('Gcode').length > 0) {				
						me.map.getLayersByName('Gcode')[0].destroy();					
					};		
					
					if (navigator.geolocation) {   
						/** Overlay current location*/		
						navigator.geolocation.getCurrentPosition(
							function(position){					
								var currLoc = new OpenLayers.Geometry.Point(position.coords.longitude,position.coords.latitude).transform('EPSG:4326', 'EPSG:900913');
								console.log('myloc--',currLoc);
								var Location = new OpenLayers.Layer.Vector(	'My Location', {
										styleMap: new OpenLayers.StyleMap({'default':{
												externalGraphic: "./chooser/icons/MyLocation.png",				
												graphicYOffset: -25,
												graphicHeight: 35,
												graphicTitle: "You're here"
										}}) ,
										displayInLayerSwitcher: false,		
										
									});		
								Location.addFeatures([new OpenLayers.Feature.Vector(currLoc)]);						
								me.map.addLayers([Location]);												
								me.map.zoomToExtent(Location.getDataExtent());		
								}
						)		
						
					} else {
						console.log("Geolocation is not supported by this browser.");
					}						
				}		
			},
			{			
				xtype:'button',
				tooltip:'Max Extent',
				icon:'./chooser/icons/phil.png',
				scale:'medium',
				width:25,
				height:25,
				handler:function(){
					var me=this.up().up();				
					
					OthoExtent = new OpenLayers.Bounds(120.613472,14.295979, 121.550385,14.827789).transform('EPSG:4326','EPSG:900913')
					
					var lonlat = new OpenLayers.LonLat(121,14).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));
					map.setCenter(lonlat);
					if (map.baseLayer.name=="BING Aerial Map")
						map.zoomTo(5);
					else if (map.baseLayer.name=="OpenStreetMap")					  
						map.zoomTo(6);
					else if (map.baseLayer.name=="Google Map - Satellite")
						map.zoomTo(6);
					else if (map.baseLayer.name=="ArcGIS Online - Imagery")
						map.zoomTo(6);		
					else if (map.baseLayer.name=="Ortho Image 2011 - Metro Manila")	
						map.zoomToExtent(OthoExtent);
					else
						map.zoomTo(1);
						
				}
					//
					
					
					
			}/*,{
				xtype:'button',
				tooltip:'Buffer tool',
				icon:'./chooser/icons/buffer.png',
				scale:'medium',
				width:25,
				height:25,
				handler:function(){
					var me = this.up().up();
						console.log(me);						
					var win = Ext.create('BufferTool', {
						map:me.map
					})					
					win.show();					
					
				}
			}*/,
			'->',
			{
				//xtype:'label',
				
				xtype:'tbtext',
				text: 'Basemap: NAMRIA Basemaps'
			
			},
			'->',
			{
				xtype:'button',
				scale:'large',
				itemId:'btnSwitch',
				icon:'./img/layers.png',				
				width:68,
				height:30,	
				tooltip:'Switch basemap',
				menu     : [
					{
						text: 'Philippine Geoportal',
						group: 'basemap',
						checked: true,
						handler: function(){
							map.setBaseLayer(map.layers[0]);
							this.up().up().up().items.items[5].setText('Basemap : ' + this.text);
						}
					},
					{
						text: 'Ortho Image 2011 - Metro Manila',
						disable: true,
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(map.layers[1]);
							this.up().up().up().items.items[5].setText('Basemap : ' + this.text);				
							OthoExtent = new OpenLayers.Bounds(120.613472,14.295979, 121.550385,14.827789).transform('EPSG:4326','EPSG:900913')
							map.zoomToExtent(OthoExtent);	
							
						}
					},
					{
						text: 'Bing Maps - Aerial',
						disable: true,
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(map.layers[2]);
							this.up().up().up().items.items[5].setText('Basemap : ' + this.text);
						}
					},
					{
						text: 'ArcGIS Online - Aerial',
						disable: true,
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(map.layers[3]);
							this.up().up().up().items.items[5].setText('Basemap : ' + this.text);
						}
					},
					{
						text: 'Open Street Map',
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(map.layers[4]);
							this.up().up().up().items.items[5].setText('Basemap : ' + this.text);
						}
					},
					{
						text: 'Google Map - Satellite',
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(map.layers[5]);
							this.up().up().up().items.items[5].setText('Basemap : ' + this.text);
						}
					},
					{
						text: 'Ortho Image 2013 to 2014 - Yolanda (Haiyan) Corridor',
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(map.layers[6]);
							this.up().up().up().items.items[5].setText('Basemap : ' + this.text);
							OthoExtent = new OpenLayers.Bounds(124.64,10.69, 126,11).transform('EPSG:4326','EPSG:900913')
							map.zoomToExtent(OthoExtent);
							map.zoomTo(10);
						}
					},
					'-',
					{
						text: '&nbsp &nbsp &nbsp &nbsp<b>NOTE:</b><br/>&nbsp &nbsp &nbsp &nbspWE HAVE OBSERVED SOME DISCREPANCIES <br/>&nbsp &nbsp &nbsp &nbspBY AS MUCH AS 10 METERS WHEN USING BASEMAPS<br/>&nbsp &nbsp &nbsp &nbspOTHER THAN THE NAMRIA BASEMAPS AND<br/>&nbsp &nbsp &nbsp &nbspORTHO IMAGE 2011-METRO MANILA.  USERS ARE <br/>&nbsp &nbsp &nbsp &nbspADVISED TO TAKE THE NECESSARY PRECAUTIONS<br/>&nbsp &nbsp &nbsp &nbspESPECIALLY WHEN VIEWING THE ACTIVE FAULTS<br/>&nbsp &nbsp &nbsp &nbsp(VALLEY FAULT SYSTEM) USING OTHER BASEMAPS.',
						plain: true
					}
					
					
			   ]
				
			}
		]	
	},
	

	
	initComponent:function(){		
	
		var popup, me=this 			
		map = new OpenLayers.Map(				
				{ 
				controls: [
					new OpenLayers.Control.Navigation(),					
					new OpenLayers.Control.Zoom(),
					new OpenLayers.Control.MousePosition(),				
				],
				
				fallThrough: true,							
				projection: 'EPSG:900913'
				
		});		
		
		//Map config
		var maxExtent = new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34);
		//var layerMaxExtent = new OpenLayers.Bounds(11128623.5489416,-55718.7227285097,16484559.8541582,3072210.74548981);
		var layerMaxExtent = new OpenLayers.Bounds( 11516520.903064, 482870.29798867,  15821300.345956,  2448728.3963715);		
		var units = 'm';
		var resolutions = [ 3968.75793751588, 
							2645.83862501058, 
							1322.91931250529, 
							661.459656252646, 
							264.583862501058, 
							132.291931250529, 
							66.1459656252646, 
							26.4583862501058, 
							13.2291931250529, 
							6.61459656252646, 
							2.64583862501058, 
							1.32291931250529, 
							0.661459656252646 ];
		var tileSize = new OpenLayers.Size(256, 256);
		var projection = 'EPSG:900913';
		var tileOrigin = new OpenLayers.LonLat(-20037508.342787,20037508.342787);
		//
		
		
	   //PGP Basemap			
      var pgp_basemap_cache = new OpenLayers.Layer.NAMRIA(
				'NAMRIA Basemap',
				'http://202.90.149.252/ArcGIS/rest/services/Basemap/PGS_Basemap/MapServer',
				{
					isBaseLayer: true,
					displayInLayerSwitcher: false,				
				}
		);
		
		//Ortho
		var pgp_ortho_mm_cache = new OpenLayers.Layer.ArcGISCache( "Ortho Image 2011 - Metro Manila",
			"http://202.90.149.252/ArcGIS/rest/services/Basemap/PGS_OrthoImage/MapServer", {
			//"http://202.90.149.252/ArcGIS/rest/services/Basemap/PGS_Basemap/MapServer", {
			isBaseLayer: true,

			//From layerInfo above                        
			resolutions: resolutions,                        
			tileSize: tileSize,
			tileOrigin: tileOrigin,
			maxExtent: layerMaxExtent, 
			projection: projection,
			displayInLayerSwitcher: false
		},
		{
			//additional options
			transitionEffect: "resize"
		});
			
		//Bing
		
		var bing_aerial = new OpenLayers.Layer.Bing({
			name: "BING Aerial Map",
			key: 'AkRWcFAhv1-J1MxSfE5URc4jiUjoL96_frNidZic_5fLeQ54al4UqXcKKr04l2ud',
			type: "Aerial",
			displayInLayerSwitcher: false
			
		}, {
			isBaseLayer: true,
			visibility: false,
			transitionEffect: "resize"
		});
		
		//ArcGIS
		
		var arcgis_world_imagery = new OpenLayers.Layer.ArcGIS93Rest("ArcGIS Online - Imagery", 
		'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export',
		{
			layers: 'show:0,1,2,3',
			format: 'png24'
		}, 
		{
			//additional options
			transitionEffect: "resize",
			isBaseLayer: true,
			displayInLayerSwitcher: false
		});
		
		//Open Street Map
		var osm  = new OpenLayers.Layer.OSM("","",
		{
			sphericalMercator: true,
			transitionEffect: "resize",
			isBaseLayer: true,
			displayInLayerSwitcher: false
		});	
		
			
	   //Google
	   var google_satellite = new OpenLayers.Layer.Google(
                "Google Map - Satellite",
                {
					type: google.maps.MapTypeId.SATELLITE, 
					numZoomLevels: 22,
					sphericalMercator: true,
					transitionEffect: "resize",
					isBaseLayer: true,
					displayInLayerSwitcher: false
				}
        );
		//
		
		//Yolanda
		yolanda_basemap = new OpenLayers.Layer.XYZ(					//Use NAMRIA Basemap Tiles
				'yolanda_basemap',
				'http://s1.geoportal.gov.ph/tiles/v2/Ortho_Image_Yolanda/${z}/${x}/${y}.png',
				{
					isBaseLayer: true,						
					sphericalMercator:true,
					displayInLayerSwitcher: false
						
			    }
		);
		//

		var Location = new OpenLayers.Layer.Vector('My Location', {
		 displayInLayerSwitcher: false,		
		});	

		var Location2 = new OpenLayers.Layer.Vector('Gcode', {
		 displayInLayerSwitcher: false,		
		});			
		
		
		
		map.addLayers([pgp_basemap_cache,pgp_ortho_mm_cache,bing_aerial, arcgis_world_imagery, osm, google_satellite, yolanda_basemap, Location, Location2]);		
		map.zoomToMaxExtent()		
		
		map.events.register('click', map, function(e){			
			if (map.layers.length > 1) {
			
				mapIndex = map.layers.length-1
				
				if (map.layers[mapIndex].name=='My Location' || map.layers[mapIndex].name=='Gcode'){
					mapIndex=mapIndex-1
					if (map.layers[mapIndex].name=='My Location' || map.layers[mapIndex].name=='Gcode'){
						mapIndex=mapIndex-1
					}				
				}		
				
				var topLayer = map.layers[mapIndex].params
				console.log(map.layers[mapIndex].params)	
				var url = "http://geoserver.namria.gov.ph/geoserver/geoportal/wms?" +
						    "request=GetFeatureInfo" + 
							"&service=WMS" + 
							"&version=1.1.1" + 
							"&layers=" + topLayer.LAYERS + 
							"&styles=" + topLayer.STYLES +  
							"&srs=" + topLayer.SRS + 			
							"&format=" + topLayer.FORMAT +							
							"&bbox=" + map.getExtent().toBBOX() +
							"&width=" + map.size.w + 
							"&height=" + map.size.h + 
							"&query_layers=geoportal:" + topLayer.LAYERS + 
							"&info_format=application/json" + 
							"&feature_count=" + 10 + 
							"&x=" + Math.round(e.xy.x) + 
							"&y=" + Math.round(e.xy.y) + 
							"&exceptions=application/json";
							
				url = "/webapi/get.ashx?url=" + escape(url);				
						me.execUrl(url, function(callback){		
								console.log(callback);	
								if (callback.features.length > 0){							
									var pos =  e.xy									
									if (popup) {
										popup.close();
									}
									popup = Ext.create('GeoExt.window.Popup', {
										title: "Feature Information",
										location: pos,
										map:map,	
										width: 300,	
										height:150,							
										items: {
											xtype:'propertygrid',
											source:callback.features[0].properties,
											hideHeaders: false,
											sortableColumns: false
										},
										autoScroll: true
									})
									popup.show();
								}	
									
						})	
					
			}
		});  
		
		
		
		Ext.apply(this, {
			map:map,
			dockedItems: [
				{ xtype: 'toolbar',
				  dock: 'top',
				  items: this.buildItems(),
				}
			]			
		});		
		this.callParent();   
    }	
	
	
});


