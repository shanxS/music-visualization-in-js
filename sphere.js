shanx2 = (function() {
     function simple_moving_averager(period) {
        var nums = [];
        return function(num) {
            nums.push(num);
            if (nums.length > period)
                nums.splice(0,1);  // remove the first element of the array
            var sum = 0;
            for (var i in nums)
                sum += nums[i];
            var n = period;
            if (nums.length < period)
                n = nums.length;
            return(sum/n);
        }
     }
     
     var sma5 = simple_moving_averager(5);
     var sma10 = simple_moving_averager(10);

     var SCREEN_WIDTH = window.innerWidth,
         SCREEN_HEIGHT = window.innerHeight,

         mouseX = 0,
         mouseY = 0,

         windowHalfX = window.innerWidth / 2,
         windowHalfY = window.innerHeight / 2,

         SEPARATION = 200,
         AMOUNTX = 10,
         AMOUNTY = 10,

         camera, scene, renderer;

     // shanxS
     var binCount;
     var lines = [];
     var particles = [];
     var zLocation = 0;
     var xLocation = 0;
     var yLocation = 0;
     var threshold = 0;
     var isCamLocationSet = 0;
     var currentCamLocation = 0;


     function onDocumentMouseMove(event) {

         mouseX = event.clientX - windowHalfX;
         mouseY = event.clientY - windowHalfY;
     }

     function onWindowResize() {

         windowHalfX = window.innerWidth / 2;
         windowHalfY = window.innerHeight / 2;

         camera.aspect = window.innerWidth / window.innerHeight;
         camera.updateProjectionMatrix();

         renderer.setSize(window.innerWidth, window.innerHeight);

     }

     function onDocumentTouchStart(event) {

         if (event.touches.length > 1) {

             event.preventDefault();

             mouseX = event.touches[0].pageX - windowHalfX;
             mouseY = event.touches[0].pageY - windowHalfY;

         }

     }

     function onDocumentTouchMove(event) {

         if (event.touches.length == 1) {

             event.preventDefault();

             mouseX = event.touches[0].pageX - windowHalfX;
             mouseY = event.touches[0].pageY - windowHalfY;

         }

     }

     var init = function(config) {

         var container, separation = 100,
             amountX = 50,
             amountY = 50,
             particle;

             
         binCount = config.count;
         
         container = document.createElement('div');
         document.body.appendChild(container);

         camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);
         camera.position.z = 1000;

         scene = new THREE.Scene();

         renderer = new THREE.CanvasRenderer();
         renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
         container.appendChild(renderer.domElement);

         // particles
         var PI2 = Math.PI * 2;
         var material = new THREE.SpriteCanvasMaterial({

             color: 0xffffff,
             program: function(context) {

                 context.beginPath();
                 context.arc(0, 0, 0.5, 0, PI2, true);
                 context.fill();

             }

         });

         for (var i = 0; i < binCount; i++) {

             particle = new THREE.Sprite(material);
             particle.position.x = Math.random() * 2 - 1;
             particle.position.y = Math.random() * 2 - 1;
             particle.position.z = Math.random() * 2 - 1;
             particle.position.normalize();
             particle.position.multiplyScalar(Math.random() * 10 + 450);
             particle.scale.multiplyScalar(2);

             particles.push(particle);
             scene.add(particle);

         }

         // lines
         for (var i = 0; i < binCount; i++) {

             var geometry = new THREE.Geometry();

             var vertex = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
             vertex.normalize();
             vertex.multiplyScalar(450);

             geometry.vertices.push(vertex);

             var vertex2 = vertex.clone();
             vertex2.multiplyScalar(Math.random() * 0.3 + 1);

             geometry.vertices.push(vertex2);
             geometry.dynamic = true;

             var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
                 color: 0xffffff,
                 linewidth: 2,
                 opacity: 1,
                 blending: THREE.AdditiveBlending,
                 depthTest: false,
                 transparent: true
             }));

             // shanxS
             lines.push(line);
             scene.add(line);


         }

         document.addEventListener('mousemove', onDocumentMouseMove, false);
         document.addEventListener('touchstart', onDocumentTouchStart, false);
         document.addEventListener('touchmove', onDocumentTouchMove, false);

         //

         window.addEventListener('resize', onWindowResize, false);

     }

     var renderFrame = function(frequencyData, waveData) {
         if (!Boolean(isCamLocationSet))
         {
            zLocation = camera.position.z;
            xLocation = camera.position.x;
            yLocation = camera.position.y;
            
            isCamLocationSet = 1;
         }
        
         var frequencyDataAverage = 0;    
         for (var i = 0; i < binCount; i++) {
             frequencyDataAverage += frequencyData[i];
            
             lines[i].material.color.setRGB(Math.random(), Math.random(), Math.random());
             particles[i].material.color.setRGB(Math.random(), Math.random(), Math.random());
         }
         
         
         frequencyDataAverage /= binCount;
         shortThreshold = sma5(frequencyDataAverage);
         threshold = sma10(frequencyDataAverage);
         if(shortThreshold > threshold && camera.position.z <= (zLocation + 50))
            camera.position.z += 5;
         else
            camera.position.z = zLocation;
         
         
         // rotation
         camera.position.x += Math.cos(currentCamLocation/100)*3;
         camera.position.y += Math.sin(currentCamLocation/100)*3;
         currentCamLocation++;
         
         camera.lookAt(scene.position);
         renderer.render(scene, camera);

     }

     var resize = function(width, height) {

         windowHalfX = window.innerWidth / 2;
         windowHalfY = window.innerHeight / 2;

         camera.aspect = window.innerWidth / window.innerHeight;
         camera.updateProjectionMatrix();

         renderer.setSize(window.innerWidth, window.innerHeight);

     }

     return {
         init: init,
         isInitialized: function() {
             return initialized;
         },
         renderFrame: renderFrame,
         resize: resize

     };