import axios from "axios";
import React, {FunctionComponent, useEffect, useRef, useState} from "react";
import config from "../config";
import { BarcodeDetector } from "barcode-detector";


export const BarCode:FunctionComponent = () => {
	const [barcode, setBarcode] = useState<string>('');
	const [latestImage, setLatestImage] = useState<string>('');
	const videoRef = useRef<HTMLVideoElement>(null);
	const imageRef = useRef<HTMLImageElement>(null);

	useEffect(() => {
		const startCamera = async () => {
			try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true });
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				videoRef.current.play();
			}
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
	}, []);

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

		const intervalId = setInterval(detectBarcode, 2000);

		return () => clearInterval(intervalId);
	}, []);

	return (
		<div>
		<video ref={videoRef} />
		{barcode && <p>Barcode detected: {barcode}</p>}
		<img ref={imageRef} src={latestImage} alt="Latest image" />
		</div>
	);
}