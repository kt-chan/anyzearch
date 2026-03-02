import os
import sys
import requests
from pathlib import Path
import json
import base64
from io import BytesIO


def convert_pdf_to_markdown(
    pdf_path, output_dir="output", server_url="http://localhost:8010"
):
    """
    Convert a PDF file to markdown with images using Mineru API

    Args:
        pdf_path: Path to the PDF file
        output_dir: Directory to save outputs (default: "output")
        server_url: Mineru API server URL (default: "http://localhost:8010")

    Returns:
        Path to the saved markdown file or None if failed
    """

    # Check if PDF exists
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file not found: {pdf_path}")
        return None

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)

    # Extract PDF name for output files
    pdf_name = Path(pdf_path).stem

    print(f"Converting: {pdf_path}")
    print(f"Output directory: {output_dir}")
    print(f"Server URL: {server_url}")

    # Initialize file handle for cleanup
    file_handle = None

    try:
        # Prepare multipart form data
        file_stem_name = Path(pdf_path).stem
        file_handle = open(pdf_path, "rb")
        files = {"files": (os.path.basename(pdf_path), file_handle, "application/pdf")}
        output_dir = os.path.join(output_dir, file_stem_name)
        os.makedirs(output_dir, exist_ok=True)

        data = {
            "return_middle_json": "false",
            "return_model_output": "false",
            "return_md": "true",
            "return_images": "true",
            "end_page_id": "99999",
            "parse_method": "auto",
            "start_page_id": "0",
            "lang_list": "en",
            "output_dir": output_dir,
            "server_url": "http://host.docker.internal:8000",
            "return_content_list": "true",
            "backend": "vlm-http-client",
            "table_enable": "true",
            "response_format_zip": "false",
            "formula_enable": "true",
        }

        print(f"Sending request to Mineru API...")

        # Make API request
        response = requests.post(
            f"{server_url}/file_parse",
            files=files,
            data=data,
            headers={"accept": "application/json"},
        )

        # Check response
        if response.status_code != 200:
            print(f"API request failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return None

        # Parse JSON response
        result = response.json()

        # Access the data: result -> results -> filename -> md_content
        if "results" in result and file_stem_name in result["results"]:
            file_data = result["results"][file_stem_name]

            # Get markdown content
            if "md_content" in file_data:
                markdown_content = file_data["md_content"]
            elif "md" in file_data:
                markdown_content = file_data["md"]
            else:
                print("No markdown content found")
                return None

            # Save markdown file
            markdown_file = os.path.join(output_dir, f"{file_stem_name}.md")

            with open(markdown_file, "w", encoding="utf-8") as f:
                f.write(markdown_content)

            print(f"Markdown saved: {markdown_file}")

            # Extract and save images if available
            images_saved_count = 0
            if "images" in file_data:
                images_dir = os.path.join(output_dir, "images")
                os.makedirs(images_dir, exist_ok=True)

                images = file_data["images"]
                for i, img_key in enumerate(images):
                    # Handle different image data formats
                    if isinstance(img_key, str):
                        # Assume base64 string
                        base64_data = images[img_key].split(",", 1)[1]
                        img_bytes = base64.b64decode(base64_data)
                        img_filename = img_key
                    else:
                        continue

                    # Save image
                    img_path = os.path.join(images_dir, img_filename)
                    with open(img_path, "wb") as f:
                        f.write(img_bytes)
                    images_saved_count += 1

                print(f"Images saved: {images_saved_count}")

        else:
            print("File not found in response results")
            return None

        # Save model output if available
        if "model_output" in result:
            model_output_file = os.path.join(
                output_dir, f"{pdf_name}_model_output.json"
            )
            with open(model_output_file, "w", encoding="utf-8") as f:
                json.dump(result["model_output"], f, indent=2, ensure_ascii=False)
            print(f"Model output saved: {model_output_file}")

        # Save content list if available
        if "content_list" in result:
            content_list_file = os.path.join(
                output_dir, f"{pdf_name}_content_list.json"
            )
            with open(content_list_file, "w", encoding="utf-8") as f:
                json.dump(result["content_list"], f, indent=2, ensure_ascii=False)
            print(f"Content list saved: {content_list_file}")

        # Save full response if needed
        response_file = os.path.join(output_dir, f"{pdf_name}_api_response.json")
        with open(response_file, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

        print(f"\nConversion complete!")

        if markdown_file and os.path.exists(markdown_file):
            # Show preview
            with open(markdown_file, "r", encoding="utf-8") as f:
                preview = f.read(200).replace("\n", " ")
            print(f"Preview: {preview}...")

        return markdown_file

    except Exception as e:
        print(f"Error during conversion: {e}")
        import traceback

        traceback.print_exc()
        return None
    finally:
        # Close file if it was opened
        if file_handle:
            file_handle.close()


def main():
    """Main function"""
    print("=" * 50)
    print("Simple Mineru PDF to Markdown Converter (Client Version)")
    print("=" * 50)

    # Check for PDF file argument
    if len(sys.argv) < 2:
        print("\nUsage: python simple_mineru.py <pdf_file> [output_directory]")
        print("\nExamples:")
        print("  python simple_mineru.py document.pdf")
        print("  python simple_mineru.py document.pdf ./converted")

        # Check if there's a PDF in current directory
        pdf_files = list(Path(".").glob("*.pdf"))
        if pdf_files:
            print(f"\nFound PDF files in current directory:")
            for i, pdf in enumerate(pdf_files, 1):
                print(f"  {i}. {pdf.name}")
            print(f"\nTo convert, run: python convertpdf2md.py {pdf_files[0].name}")

        return

    pdf_file = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "output"

    # Convert PDF
    convert_pdf_to_markdown(pdf_file, output_dir)


if __name__ == "__main__":
    main()
