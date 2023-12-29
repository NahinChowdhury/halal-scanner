import axios from "axios";
import React, {FunctionComponent, useEffect, useRef, useState} from "react";
import config from "../config";
import { BarcodeDetector } from "barcode-detector";


export const BarCode:FunctionComponent = () => {
	const [barcode, setBarcode] = useState<string>('');
	const [latestImage, setLatestImage] = useState<string>('');
	const videoRef = useRef<HTMLVideoElement>(null);
	const imageRef = useRef<HTMLImageElement>(null);
	const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
	const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[] | null>(null);
	const [ingredients, setIngredient] = useState<any>({})

	const handleDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
	  setSelectedDeviceId(event.target.value);
	};

	useEffect(() => {
		if(videoDevices !== null) return;
		
		navigator.mediaDevices.getUserMedia({
			video: true,
		}).then(stream => {
			navigator.mediaDevices.enumerateDevices().then(devices => {
				const videoDevices = devices.filter(device => device.kind === 'videoinput');
				setVideoDevices(videoDevices);
				setSelectedDeviceId(videoDevices[0].deviceId);
			});
		}).catch(err => {
				alert('Please allow camera access to use this app');
				console.error(err);
		});
	}, [videoDevices]);

	useEffect(() => {
		const startCamera = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: { deviceId: selectedDeviceId ? selectedDeviceId : undefined },
				});

				if (videoRef.current) {
					videoRef.current.srcObject = stream;
					videoRef.current.play();
				}

				// const devices = await navigator.mediaDevices.enumerateDevices();
				// const videoDevices = devices.filter(device => device.kind === 'videoinput');
				// setVideoDevices(videoDevices);
			} catch (error) {
				console.error('Error starting camera:', error);
				alert('Please allow camera access to use this app.');
			}
		};

		startCamera();

		return () => {
			if (videoRef.current) {
				const stream = videoRef.current.srcObject as MediaStream;
				if (stream) {
					stream.getTracks().forEach(track => track.stop());
				}
			}
		};
	}, [selectedDeviceId]);

	useEffect(() => {
		const barcodeDetector = new BarcodeDetector({
			formats: ["qr_code", "ean_13", "code_128", "code_39", "upc_a", "upc_e", "aztec", "codabar", "data_matrix", "ean_8", "itf", "pdf417"]
			});

			const detectBarcode = async () => {
			if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
				const canvas = document.createElement('canvas');
				canvas.width = videoRef.current.videoWidth;
				canvas.height = videoRef.current.videoHeight;
				const ctx = canvas.getContext('2d');
				if (ctx) {
					ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
					const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
					setLatestImage(canvas.toDataURL());
					try {
						const barcodes = await barcodeDetector.detect(imageData);
						if (barcodes.length > 0) {
							setBarcode(barcodes[0].rawValue);
							const stream = videoRef.current.srcObject as MediaStream;
							if (stream) {
								stream.getTracks().forEach(track => track.stop());
							}
						}
					} catch (error) {
						console.error('Error detecting barcode:', error);
					}
				}
			}
		};

		const intervalId = setInterval(detectBarcode, 100);

		return () => clearInterval(intervalId);
	}, []);

	useEffect(() => {
		if (barcode) {
			axios.get(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`)
				.then(response => {
					console.log(response);
					const data = response.data
					if(data.status === 0) {
						alert("Product not found");
						return;
					} else{
						if (data?.product?.ecoscore_data?.missing) {
							const missingKeys = data.product.ecoscore_data.missing;
							console.log(missingKeys)
							console.log(typeof missingKeys)
							
							if ('ingredients' in missingKeys) {
							  console.log('No ingredients provided');
							} else {
								let ingredients = '';
								
								if (data.product.ingredients_text_en) {
									ingredients = data.product.ingredients_text_en;
								} else if (data.product.ingredients_text) {
									ingredients = data.product.ingredients_text;
								}
								
								setIngredient(ingredients);
							}
						  }
					} 
				});
		}
	}, [barcode]);

	return (
		<div>
			<select onChange={handleDeviceChange}>
				{videoDevices?.map(device => (
					<option key={device.deviceId} value={device.deviceId}>
					{device.label}
					</option>
				))}
			</select>
			<video ref={videoRef} />
			{barcode && <p>Barcode detected: {barcode}</p>}
			<img ref={imageRef} src={latestImage} alt="Latest image" />
			{ingredients && <p>Ingredients: {JSON.stringify(ingredients)}</p>}
		</div>
	);
}