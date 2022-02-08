
var rhit = rhit || {};
var d3 = d3 || {};

/* Main */
/** function and class syntax examples */
rhit.main = function () {

	console.log("Ready");


	const map = new Map();
	var myWords = [{"text": "testSymptom", "size": -1}];

	var frequency_list = [
		{"text":"好看", "size":50},
		{"text":"安利", "size":20},
		// {"text":"一定去看", "size":40},
		// {"text":"三刷啦", "size":30},
		// {"text":"超感人的", "size":19},
		// {"text":"上座率爆炸", "size":100},
		// {"text":"人满为患", "size":50},
		// {"text":"抢到票了", "size":70},
		// {"text":"特效炒鸡棒", "size":90},
		// {"text":"泪目", "size":120},
		// {"text":"真的好好看", "size":54},
		// {"text":"哈哈哈哈", "size":555},
		// {"text":"大家随意", "size":220},
		// {"text":"搞起来", "size":80},
		// {"text":"五排啊", "size":19},
		// {"text":"王者上机", "size":100}
	];


	loadCSV(file: string) {
		return new Promise(function (resolve, reject){
			d3.csv(file, function(error, request) {
				if(error) {
				   reject(error);
				} else {
				   resolve(request);
				}
			 });
		 });
	 }
	
		
	    d3.csv('../data/2020VAERSSYMPTOMS.csv', d3.autoType,
		function(d){
			for(let index = 0; index < 10; index++){
				const element = d[index];
		
				frequency_list.push({"text":`${element.SYMPTOM1}`,"size": 50});
				
				
				//console.log(element);
				//1
				// if(map.has(element.SYMPTOM1)){
				// 	let temp = map.get(element.SYMPTOM1);
				// 	map.set(element.SYMPTOM1, temp+1);
				// }
				// else{
				// 	map.set(element.SYMPTOM1, 1);
				// }
				// //2
				// if(map.has(element.SYMPTOM2)){
				// 	let temp = map.get(element.SYMPTOM2);
				// 	map.set(element.SYMPTOM2, temp+1);
				// }
				// else{
				// 	map.set(element.SYMPTOM2, 1);
				// }
				// //3
				// if(map.has(element.SYMPTOM3)){
				// 	let temp = map.get(element.SYMPTOM3);
				// 	map.set(element.SYMPTOM3, temp+1);
				// }
				// else{
				// 	map.set(element.SYMPTOM1, 1);
				// }
				// //4
				// if(map.has(element.SYMPTOM4)){
				// 	let temp = map.get(element.SYMPTOM4);
				// 	map.set(element.SYMPTOM4, temp+1);
				// }
				// else{
				// 	map.set(element.SYMPTOM4, 1);
				// }
				// //5
				// if(map.has(element.SYMPTOM5)){
				// 	let temp = map.get(element.SYMPTOM5);
				// 	map.set(element.SYMPTOM5, temp+1);
				// }
				// else{
				// 	map.set(element.SYMPTOM5, 1);
				// }
			}
			
		}).then(() => {
			console.log(frequency_list.length);
		}); 
	
	
	



	
	
   //自定义一个线性非连贯比例尺来进行给不同大小的词赋颜色.
//   var color = d3.scale.linear()
//            .domain([0,1,2,3,4,5,6,10,15,20,100])
//            .range(["#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777", "#666", "#555", "#444", "#333", "#222"]); 


	console.log("NOW size = ",frequency_list.length);
	var color = d3.scale.category20();  //直接使用d3的方法，产生20种类别的颜色
	
 
	var layout = d3.layout.cloud()
			.size([400, 300])
			.words(frequency_list)
			.rotate(0)
			.fontSize(function(d) { return d.size; })
			.on("end", draw);

	layout.start();

	function draw(words) {
		
		console.log("gan ni mama");
		
			console.log("草泥马的");
			d3.select("#container").append("svg")//根据id插入svg
				.attr("width", layout.size()[0])//宽度
				.attr("height", layout.size()[1])//高度
				.attr("viewBox","0 0 600 350")//可见区域
				.attr("style", "border: 1px solid black")//区域样式
				.attr("preserveAspectRatio","xMaxYMax meet")
				.attr("class", "wordcloud")
				.append("g")
				.attr("transform", "translate(200,100)")
				.selectAll("text")
				.data(words)
				.enter().append("text")
				.style("font-size", function(d) { return d.size + "px"; })
				.style("fill", function(d, i) { return color(i); })//颜色
				.attr("transform", function(d) {//每个词条的偏移量
					return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
				})
				.text(function(d) { return d.text; });//内容
		
	}





		// getting dummy data: MESSING AROUND ONLY
	// d3.csv('../data/DUMMY_DATA.csv', d3.autoType).then(
	// 	function(d){
	// 		console.log(d);
	// 		//DUMMY_DATA = d;
	// 		// for(let index = 0; index < d.length; index++){
	// 		// 	const element = d[index];
	// 		// 	DUMMY_DATA+=element;
	// 		// }
	// 	}

	// )
	
	
};

rhit.main();
