
Ext.Loader.setConfig({
disableCaching: false,
enabled: true,
paths: {   
    MyPath:'./',
	GeoExt: "./lib/GeoExt",		
	} 
});

Ext.application({
    name: 'OL3EXT4',	
	requires:[
		'mappanel',		
		'Utilities',
		'LoadedLayerContextMenu',
		'USGSdata',
		'BufferTool', 
		'Chooser.Window', 
		'Chooser.IconBrowser',		
		'GeoExt.container.WmsLegend', //needed to display legend in the legendpanel
		'GeoExt.tree.Panel',
		'Ext.tree.plugin.TreeViewDragDrop',
		'GeoExt.tree.OverlayLayerContainer',
		'GeoExt.tree.BaseLayerContainer',
		'GeoExt.data.LayerTreeModel',
		'GeoExt.tree.View',		
		'GeoExt.tree.Column',		
		],
    launch: function () {
			
		
		var MapPanel= Ext.create('mappanel');
		
		
		var store = Ext.create('Ext.data.TreeStore', {
            model: 'GeoExt.data.LayerTreeModel',
            root: {
                plugins: [{
                    ptype: "gx_layercontainer",
                    loader: {
                        createNode: function(attr) {                            
									
								var title = attr.layer.params.LAYERS
							    if (title.indexOf('safe')>0){
							    	title='Suitable Area'	
									
							    }else{
							    	title='Multihazard'
									
							    }
									
								// add a WMS legend to each node created
								attr.component = {
									xtype: "gx_wmslegend",
									layerRecord: MapPanel.layers.getByLayer(attr.layer),
									showTitle: false,
									// custom class for css positioning
									// see tree-legend.html
									legendTitle:title,
									cls: "legend"
								};
								return GeoExt.tree.LayerLoader.prototype.createNode.call(this, attr);
							
                        }
                    }
                }]
            }
        });
		
		
		var tree = Ext.create('GeoExt.tree.Panel', {
            region: "east",
            title: "Layers",
            width: 250,
            autoScroll: true,
            viewConfig: {
                plugins: [{
                    ptype: 'treeviewdragdrop',
                    appendOnly: false
                }]
            },
            store: store,
            rootVisible: false,
            lines: false
        });
		
		
					
		tree.on('itemcontextmenu', function(view, record, item, index, event){
            //alert(record)
			console.log(event.getXY);
			showContextMenu(record,event.getXY())
            //treePanelCurrentNode = record;
            //menu1.showAt(event.getXY());
            event.stopEvent();
		},this);		
		
		var ChooserPanel = Ext.create('Chooser.Window', {
			id: 'img-chooser-dlg',
			region:'west',									
			mappanel:MapPanel,	
			title:'Please select a province',
			//collapsed:true,
			Tpanel:tree	
			}	
		);    		
		
		
		//
		function showContextMenu(record, coord){
	
		var contextMenu = Ext.create('LoadedLayerContextMenu', {
			width: 160,
			items: [
				{
					text        : '0%&nbsp;&nbsp;&nbsp;&nbsp;Opacity&nbsp;&nbsp;&nbsp;&nbsp;100%',
					canActivate : false,
					hideOnClick : true,
					shadow: true,
					style       : {
							marginTop  : '-5px',
							fontSize   : '9px'
						}
				},
				Ext.create('Ext.slider.Single', {
					width: 100,
					value: 100,
					increment: 1,
					minValue: 0,
					maxValue: 100,
					listeners : {
									change : function(slider,newVal) {
										record.raw.layer.setOpacity(newVal/100)
									}
								} 
				}),
				{
					text: 'Move to top',
					handler: function(){
						record.raw.layer.map.setLayerIndex(record.raw.layer, record.raw.layer.map.layers.length-1);
					}
				
				},
				{
					text: 'Zoom to extent',
					handler: function(){
					
						var layer = record.raw.layer;
						var layerName = layer.params.LAYERS.replace("geoportal:","");
						
						var mapProjection = record.raw.layer.map.projection.replace("EPSG:","");
						
						var sql = "select st_xmin(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as xmin,st_ymin(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as ymin,st_xmax(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as xmax,st_ymax(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as ymax from " + layerName;

						Ext.Ajax.request({
							
							url: "/webapi/api/util/querytableasjson?database=geoportal&sql=" + sql,
							method: 'GET',
							success: function(r){
								var obj = Ext.decode(r.responseText);
								var bounds= new OpenLayers.Bounds(obj.result[0].xmin,obj.result[0].ymin,obj.result[0].xmax,obj.result[0].ymax);
								record.raw.layer.map.zoomToExtent(bounds);
							}
						});
						 
						
						
					}
				
				},
				{
					text: 'Zoom to make visible',
					handler: function(){
					
						var layer = record.raw.layer;
						var layerName = layer.params.LAYERS.replace("geoportal:","");
						
						var mapProjection = record.raw.layer.map.projection.replace("EPSG:","");
						
						var sql = "select st_xmin(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as xmin,st_ymin(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as ymin,st_xmax(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as xmax,st_ymax(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as ymax from " + layerName + " group by ogc_fid limit 1";

						Ext.Ajax.request({
							url: "/webapi/api/util/querytableasjson?database=geoportal&sql=" + sql,							
							method: 'GET',
							success: function(r){
								var obj = Ext.decode(r.responseText);
								var bounds= new OpenLayers.Bounds(obj.result[0].xmin,obj.result[0].ymin,obj.result[0].xmax,obj.result[0].ymax);
								record.raw.layer.map.zoomToExtent(bounds);
							}
						});
						 
						
						
					}
				
				},
				{
					text: 'Remove layer',
					handler: function(){
						record.raw.layer.map.removeLayer(record.raw.layer);
					}
				
				}
				] 
			});
		
			contextMenu.showAt(coord);
		}
		//
		
        Ext.create('Ext.container.Viewport', {	
            layout: 'border',						
            items:[			
				MapPanel,
				ChooserPanel,
				
				tree
            ]
        });	
    }
});


