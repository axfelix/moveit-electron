"""
GUI tool to create a Bag from a filesystem folder.
"""

import sys
import os
import shutil
import bagit
from time import strftime
from distutils.dir_util import copy_tree
import tempfile
import zerorpc
import json

class MoveIt(object):
    def bag_package(self, contactname, jobtitle, department, email, phone, creator, rrsda, title, datefrom, dateto, description, metadata, package_folder):
        bag_dir_parent = tempfile.mkdtemp()
        if os.path.isdir(bag_dir_parent):
            shutil.rmtree(bag_dir_parent)
        bag_dir = os.path.join(bag_dir_parent, 'bag')
        os.makedirs(os.path.join(bag_dir, os.path.basename(package_folder.strip('"'))))
        copy_tree(os.path.normpath(package_folder.strip('"')), os.path.join(bag_dir, os.path.basename(package_folder.strip('"'))))

        for root, sub, files in os.walk(bag_dir):
            for file in files:
                if file == ".DS_Store":
                    os.remove(os.path.abspath(os.path.join(root, file)))

        try:
            with open("package.json", "r") as package_json:
                version = json.load(package_json)['version']
        except:
            with open("gui/package.json", "r") as package_json:
                version = json.load(package_json)['version']

        try:
            bag = bagit.make_bag(bag_dir, None, 1, ['sha256'])
            bag.info['Package-Time'] = strftime("%Y-%m-%d %H:%M:%S")
            bag.info['Bag-Software-Agent'] = "MoveIt " + version
            bag.info['Contact-Name'] = contactname
            bag.info['Contact-Title'] = jobtitle
            bag.info['Contact-Organization'] = department
            bag.info['Contact-Email'] = email
            bag.info['Contact-Phone'] = phone
            bag.info['Source-Organization'] = creator
            bag.info['RRSDA-Number'] = rrsda
            bag.info['External-Identifier'] = title
            bag.info['Year-Start'] = datefrom
            bag.info['Year-End'] = dateto
            bag.info['External-Description'] = description
            bag.info['Other-Available-Metadata'] = metadata
            bag.info['Internal-Sender-Identifier'] = ''
            bag.info['Internal-Sender-Description'] = ''
            bag.info['Internal-Validation-Date'] = ''
            bag.info['Internal-Validation-By'] = ''
            bag.info['Internal-Validation-Note'] = ''
            bag.save()
        except (bagit.BagError, Exception) as e:
            return False

        bag_destination = os.path.join(str(bag_dir_parent), (title))
        zipname = shutil.make_archive(bag_destination, 'zip', bag_dir)
        shutil.rmtree(bag_dir)

        desktopPath = os.path.expanduser("~/Desktop/")
        shutil.move(zipname, os.path.join(desktopPath, os.path.basename(zipname)))
        return True

if __name__ == '__main__':
    s = zerorpc.Server(MoveIt())
    s.bind('tcp://127.0.0.1:' + str(sys.argv[1]))
    s.run()