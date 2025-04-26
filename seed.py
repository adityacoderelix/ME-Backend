import csv
import json

def csv_to_json(csv_file_path, json_file_path, has_header=True):
    """
    Converts a CSV file to a JSON file using specific columns.
    
    Args:
        csv_file_path (str): Path to the input CSV file.
        json_file_path (str): Path where the output JSON file will be written.
        has_header (bool): True if the CSV file has a header row. If False, default
                           headers will be assigned.
    """
    data = []
    
    with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
        if has_header:
            reader = csv.DictReader(csv_file)
        else:
            # Define the headers manually if the CSV has no header row.
            fieldnames = ["district", "taluka", "area", "registrationNo", "propertyName", "noOfRooms"]
            reader = csv.DictReader(csv_file, fieldnames=fieldnames)
        
        for row in reader:
            # Clean up or convert data if needed (e.g., strip whitespace)
            record = {
                "district": row.get("district", "").strip(),
                "taluka": row.get("taluka", "").strip(),
                "area": row.get("area", "").strip(),
                "registrationNo": row.get("registrationNo", "").strip(),
                "propertyName": row.get("propertyName", "").strip(),
                "noOfRooms": row.get("noOfRooms", "").strip()
            }
            data.append(record)
    
    with open(json_file_path, mode='w', encoding='utf-8') as json_file:
        json.dump(data, json_file, indent=4)

# --- Example usage ---

# If your CSV has a header row:
csv_to_json('input.csv', 'output.json', has_header=True)

# If your CSV does not have a header row, use:
# csv_to_json('input.csv', 'output.json', has_header=False)
