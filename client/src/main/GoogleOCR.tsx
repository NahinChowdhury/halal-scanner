import axios from "axios";
import React, {FunctionComponent, useEffect, useState} from "react";
import config from "../config";


export const GoogleOCR:FunctionComponent = () => {
	const [extractedText, setExtractedText] = useState<string>('');
	const [cleanedText, setCleanedText] = useState<string>('');
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [base64Image, setBase64Image] = useState<string | null>('');
	const [grayscaleBase64Image, setGrayscaleBase64Image] = useState<string | null>('');

	const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		grayscaleImage();
		setExtractedText('');
		setCleanedText('');
	}, [selectedImage])

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			const file = event.target.files[0];
			setSelectedImage(file);
	
			// Convert the selected image to Base64
			if (file) {
				convertImageToBase64(file, (base64String: string | null) => {
					setBase64Image(base64String);
				});
			}
		}
	};

	const convertImageToBase64 = (file: File, callback: (base64String: string | null) => void) => {
		if (!file) {
			callback(null);
			return;
		}
	
		const reader = new FileReader();
		reader.onload = (event) => {
			if (typeof event?.target?.result === 'string') {
				const base64String = event.target.result.split(',')[1];
				callback(base64String);
			} else {
				callback(null);
			}
		};
	
		reader.readAsDataURL(file);
	};

	const grayscaleImage = () => {
		if (!selectedImage || !canvasRef.current) {
			return;
		}
	
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		const image = new Image();
		image.src = URL.createObjectURL(selectedImage);
		image.onload = () => {
			if (!ctx) {
				console.log("ctx not found")
				return;
			}
			canvas.width = image.width;
			canvas.height = image.height;
			ctx.drawImage(image, 0, 0);
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	
			for (let i = 0; i < imageData.data.length; i += 4) {
				// Calculate grayscale value using the luminance formula
				const grayscale = 0.299 * imageData.data[i] + 0.587 * imageData.data[i + 1] + 0.114 * imageData.data[i + 2];
				// Set RGB values to grayscale value
				imageData.data[i] = grayscale;
				imageData.data[i + 1] = grayscale;
				imageData.data[i + 2] = grayscale;
			}
	
			ctx.putImageData(imageData, 0, 0);
			convertCanvasToBase64(canvas, (grayscaleBase64String: string | null) => {
				setGrayscaleBase64Image(grayscaleBase64String);
			});
		};
	};

	const convertCanvasToBase64 = (canvas: HTMLCanvasElement | null, callback: (base64String: string | null) => void) => {
		if (!canvas) {
			callback(null);
			return;
		}
	
		const dataUrl = canvas.toDataURL('image/jpeg');
		if (typeof dataUrl === 'string') {
			const base64String = dataUrl.split(',')[1];
			callback(base64String);
		} else {
			callback(null);
		}
	};

	const handleExtractText = async () => {
		if (!selectedImage) {
			return;
		}

		const apiKey = config.API_KEY
		try {
			const requestData = {
				requests: [
					{
						image: {
							content: grayscaleBase64Image || base64Image,
						},
						features: [
							{
							type: 'TEXT_DETECTION',
							maxResults: 1,
							},
						],
					},
				],
			};

			const response = await axios.post(
				`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
				requestData
			);

			const text = response.data.responses[0]?.textAnnotations[0]?.description || 'No text found';
			setExtractedText(text);
			extractIngredients(text);
		} catch (error: any) {
			console.error('Error extracting text:', error);
			console.error('Error response data:', error.response.data);
			console.error('Error response text:', error.response.statusText);
		}
	};

	const extractIngredients = (text: string) => {
		// Use regular expression to find the English ingredients
		const regex = /Ingredients:(.*?)(Ingrédients|Ingredients):/si;
		const match = text.match(regex);

		if (match && match[1]) {
			// Extract the English ingredients and remove extra whitespaces
			const englishIngredients = match[1]
				.split('\n') // Split by newlines
				.map((line) => line.trim()) // Trim each line
				.filter((line) => line.length > 0) // Remove empty lines
				.join(', '); // Join with commas
			setCleanedText(englishIngredients);
			console.log(englishIngredients);
		} else {
			console.log('No English ingredients found.');
			setCleanedText('No English ingredients found.');
		}
	};

	return (
		<div>
		<h1>Google OCR App</h1>
		<input type="file" accept="image/*" onChange={handleFileChange} />
		<button onClick={handleExtractText}>Extract Text</button>

		{selectedImage && (
			<div>
				<h2>Selected Image:</h2>
				<img src={URL.createObjectURL(selectedImage)} alt="Selected" width="300" />
			</div>
		)}
		{grayscaleBase64Image && (
			<h2>Grayscale Image:</h2>
		)}
		<canvas ref={canvasRef} />
		
		
		{extractedText && (
			<div>
				<h2>Extracted Text:</h2>
				<p>{extractedText}</p>
			</div>
		)}
		
		{cleanedText && (
			<div>
				<h2>Cleaned Text:</h2>
				<p>{cleanedText}</p>
			</div>
		)}
		</div>
	);
}