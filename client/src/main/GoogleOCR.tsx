import axios from "axios";
import React, {FunctionComponent, useEffect, useState} from "react";
import config from "../config";
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/solid'


export const GoogleOCR:FunctionComponent = () => {
	const [extractedText, setExtractedText] = useState<string>('');
	const [cleanedText, setCleanedText] = useState<string>('');
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [base64Image, setBase64Image] = useState<string | null>('');
	const [grayscaleBase64Image, setGrayscaleBase64Image] = useState<string | null>('');
	const [fetchingText, setFetchingText] = useState<boolean>(false);

	const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
	const textAreaRef = React.useRef<HTMLDivElement | null>(null);
	const inputRef = React.useRef<HTMLInputElement | null>(null);

	const onDrop = useCallback((acceptedFiles: any) => {
		// Handle dropped files
		if (acceptedFiles.length > 0) {
			const file = acceptedFiles[0];

			URL.revokeObjectURL(file.preview)
			
			setSelectedImage(file);

			// Convert the selected image to Base64
			if (file) {
				convertImageToBase64(file, (base64String: string | null) => {
					setBase64Image(base64String);
				});
			}

		}

	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: {
		  'image/*': []
		},
		// maxSize: 1024 * 1000,
		onDrop
	})

	useEffect(() => {
		if (!textAreaRef.current) return;
	
		const handlePasteFile = async (event: ClipboardEvent) => {
		  if (event.clipboardData?.files) {
			(inputRef.current as unknown as HTMLInputElement).files =
			  event.clipboardData.files;
			inputRef.current?.dispatchEvent(new Event("change", { bubbles: true }));
		  }
		};
		textAreaRef.current.addEventListener("paste", handlePasteFile);
		return () =>
		  textAreaRef.current?.removeEventListener("paste", handlePasteFile);
	}, [textAreaRef]);


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

		setFetchingText(true);
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
			
			setFetchingText(false);
			const text = response.data.responses[0]?.textAnnotations[0]?.description || 'No text found';
			setExtractedText(text);
			extractIngredients(text);
		} catch (error: any) {
			setFetchingText(false);
			console.error('Error extracting text:', error);
			console.error('Error response data:', error.response.data);
			console.error('Error response text:', error.response.statusText);
		}
	};

	const extractIngredients = (text: string) => {
		// Use regular expression to find the English ingredients
		const regex = /Ingredients\s?:(.*?)(Ingrédients|Ingredients)\s?:/si;
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
			<div ref={textAreaRef}>
				<div
					{...getRootProps({ style: { padding: '16rem', marginTop: '10rem', border: '1px solid black', width: '30%', marginLeft: 'auto', marginRight: 'auto' }})}
				>
					<input {...getInputProps()} ref={inputRef}/>
					<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4rem'}}>
						<ArrowUpTrayIcon style={{width: '5rem', height: '5rem'}} />
						{isDragActive ? (
							<p>Drop the files here ...</p>
						) : (
							<p>Drag & drop files here, or click to select files</p>
						)}
					</div>
				</div>
			</div>

			{/* <input type="file" accept="image/*" onChange={handleFileChange} /> */}
			<div style={{display: 'flex', justifyContent: 'center', margin: '2rem 0'}}>
				<button onClick={handleExtractText}>Confirm</button>
			</div>

			{selectedImage && (
				<div>
					<h2>Selected Image:</h2>
					<img src={URL.createObjectURL(selectedImage)} alt="Selected" width="300" />
				</div>
			)}
			{/* {grayscaleBase64Image && (
				<h2>Grayscale Image:</h2>
			)}
			<canvas ref={canvasRef} /> */}
			
			{fetchingText && (
				<div>
					<p>Fetching text...</p>
				</div>
			)}

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