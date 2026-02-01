from PIL import Image
import io

class ImageConverter:
    @staticmethod
    def convert(file_content: bytes, target_format: str) -> bytes:
        image = Image.open(io.BytesIO(file_content))
        output = io.BytesIO()
        
        # Handle alpha channel for JPEGs
        if target_format.lower() in ['jpg', 'jpeg'] and image.mode == 'RGBA':
            image = image.convert('RGB')
            
        image.save(output, format=target_format.upper())
        return output.getvalue()
